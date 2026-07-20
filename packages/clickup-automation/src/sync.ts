import * as client from './client';
import * as queue from './queue';
import { getConfig } from './config';
import type { TaskEvent, TaskStatus, SyncResult, CommitRule } from './types';

export interface CommitInfo {
  message: string;
  hash?: string;
  branch?: string;
  author?: string;
}

export interface QueueProcessingOptions {
  maxEvents?: number;
  maxDurationMs?: number;
}

export function parseCommitMessage(message: string): { prefix: string; taskName: string | null; body: string } | null {
  const config = getConfig();

  for (const rule of config.commitRules) {
    if (message.toLowerCase().startsWith(rule.prefix.toLowerCase())) {
      const afterPrefix = message.slice(rule.prefix.length).trim();
      const taskMatch = afterPrefix.match(/\[([^\]]+)\]/);
      const taskName = taskMatch ? taskMatch[1] : null;
      const body = taskMatch ? afterPrefix.replace(taskMatch[0], '').trim() : afterPrefix;
      return { prefix: rule.prefix, taskName, body };
    }
  }

  return null;
}

export function getCommitRule(prefix: string): CommitRule | null {
  const config = getConfig();
  return config.commitRules.find(r => r.prefix.toLowerCase() === prefix.toLowerCase()) || null;
}

export async function processCommit(commit: CommitInfo): Promise<SyncResult> {
  const result: SyncResult = { success: true, created: [], updated: [], errors: [] };
  const parsed = parseCommitMessage(commit.message);
  if (!parsed) return result;

  const rule = getCommitRule(parsed.prefix);
  if (!rule) return result;

  let taskName = parsed.taskName;
  if (!taskName && commit.branch) {
    const config = getConfig();
    for (const pattern of config.branchPatterns || []) {
      const regex = new RegExp(pattern.pattern);
      const match = commit.branch.match(regex);
      if (match && pattern.extractTaskName && match[1]) {
        taskName = match[1].replace(/-/g, ' ').replace(/_/g, ' ');
        break;
      }
    }
  }
  if (!taskName) return result;

  try {
    const task = await client.findTaskFuzzy(taskName);
    if (task) {
      if (rule.status && task.status !== rule.status) {
        await client.setStatus(task.id, rule.status);
        result.updated.push(task.name);
      }
      if (rule.commentTemplate) {
        const comment = rule.commentTemplate
          .replace('{{message}}', parsed.body || commit.message)
          .replace('{{hash}}', commit.hash || '')
          .replace('{{author}}', commit.author || '')
          .replace('{{branch}}', commit.branch || '');
        await client.addComment(task.id, comment);
      }
    } else {
      queue.enqueue({
        type: 'status_change',
        taskName,
        status: rule.status,
        comment: parsed.body,
        metadata: { commit: commit.hash, branch: commit.branch },
      });
    }
  } catch (error) {
    result.errors.push({ task: taskName, error: error instanceof Error ? error.message : String(error) });
    result.success = false;
  }

  return result;
}

export async function processQueue(options: QueueProcessingOptions = {}): Promise<SyncResult> {
  const result: SyncResult = { success: true, created: [], updated: [], errors: [] };
  const maxEvents = Math.max(1, options.maxEvents ?? 25);
  const maxDurationMs = Math.max(250, options.maxDurationMs ?? 5000);
  const startedAt = Date.now();
  let processed = 0;

  while (processed < maxEvents && Date.now() - startedAt < maxDurationMs) {
    const event: TaskEvent | null = queue.dequeue();
    if (!event) break;

    try {
      if (event.taskId) {
        if (event.status) {
          await client.setStatus(event.taskId, event.status);
          result.updated.push(event.taskId);
        }
        if (event.comment) await client.addComment(event.taskId, event.comment);
      } else if (event.taskName) {
        const task = await client.findTaskFuzzy(event.taskName);
        if (task) {
          if (event.status && task.status !== event.status) {
            await client.setStatus(task.id, event.status);
            result.updated.push(task.name);
          }
          if (event.comment) await client.addComment(task.id, event.comment);
        }
      }

      queue.markProcessed(event.id);
      processed += 1;
      await new Promise(resolve => setTimeout(resolve, 150));
    } catch (error) {
      result.errors.push({
        task: event.taskName || event.taskId || 'unknown',
        error: error instanceof Error ? error.message : String(error),
      });
      result.success = false;
      // Leave the failed event pending for a later retry, but stop this pass.
      // Continuing would dequeue the same event forever.
      break;
    }
  }

  return result;
}

export async function syncTask(taskName: string, status: TaskStatus, comment?: string): Promise<boolean> {
  if (!client.isConfigured()) {
    queue.enqueue({ type: 'status_change', taskName, status, comment });
    return true;
  }

  try {
    const task = await client.findTaskFuzzy(taskName);
    if (!task) {
      queue.enqueue({ type: 'status_change', taskName, status, comment });
      return false;
    }
    if (task.status !== status) await client.setStatus(task.id, status);
    if (comment) await client.addComment(task.id, comment);
    return true;
  } catch {
    queue.enqueue({ type: 'status_change', taskName, status, comment });
    return false;
  }
}

export async function done(taskName: string, comment?: string): Promise<boolean> {
  return syncTask(taskName, 'DONE', comment ? `✅ ${new Date().toLocaleDateString()}\n\n${comment}` : undefined);
}

export async function doing(taskName: string, comment?: string): Promise<boolean> {
  return syncTask(taskName, 'DOING', comment ? `🔄 ${new Date().toLocaleDateString()}\n\n${comment}` : undefined);
}

export async function waiting(taskName: string, comment?: string): Promise<boolean> {
  return syncTask(taskName, 'WAITING', comment ? `⏸️ ${new Date().toLocaleDateString()}\n\n${comment}` : undefined);
}
