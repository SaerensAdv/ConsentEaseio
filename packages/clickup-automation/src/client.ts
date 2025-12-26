import type { ClickUpTask, TaskStatus, TaskPriority, SyncResult } from './types';
import { getConfig } from './config';

function getApiKey(): string {
  const key = process.env.CLICKUP_API_KEY;
  if (!key) throw new Error('CLICKUP_API_KEY environment variable is required');
  return key;
}

async function request<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': getApiKey(),
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ClickUp API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function getLists(): Promise<{ id: string; name: string }[]> {
  const config = getConfig();
  const data = await request<{ lists: any[] }>(`https://api.clickup.com/api/v2/folder/${config.folderId}/list`);
  return data.lists.map(l => ({ id: l.id, name: l.name }));
}

export async function getListByName(name: string): Promise<{ id: string; name: string } | null> {
  const lists = await getLists();
  return lists.find(l => l.name.toLowerCase() === name.toLowerCase()) || null;
}

export async function createList(name: string): Promise<{ id: string; name: string }> {
  const config = getConfig();
  const data = await request<any>(`https://api.clickup.com/api/v2/folder/${config.folderId}/list`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return { id: data.id, name: data.name };
}

export async function getOrCreateList(name: string): Promise<{ id: string; name: string }> {
  const existing = await getListByName(name);
  return existing || createList(name);
}

export async function getAllTasks(includeClosed = true): Promise<ClickUpTask[]> {
  const lists = await getLists();
  const tasks: ClickUpTask[] = [];

  for (const list of lists) {
    const data = await request<{ tasks: any[] }>(
      `https://api.clickup.com/api/v2/list/${list.id}/task?include_closed=${includeClosed}`
    );
    for (const t of data.tasks) {
      tasks.push({
        id: t.id,
        name: t.name,
        description: t.description,
        status: t.status?.status?.toUpperCase() as TaskStatus,
        priority: t.priority?.id as TaskPriority,
        tags: t.tags?.map((tag: any) => tag.name) || [],
        listName: list.name,
        listId: list.id,
        url: t.url,
      });
    }
    await delay(100);
  }

  return tasks;
}

export async function findTask(name: string): Promise<ClickUpTask | null> {
  const tasks = await getAllTasks();
  const normalized = name.toLowerCase().trim();
  return tasks.find(t => t.name.toLowerCase().trim() === normalized) || null;
}

export async function findTaskFuzzy(search: string): Promise<ClickUpTask | null> {
  const tasks = await getAllTasks();
  const normalized = search.toLowerCase().trim();
  
  let bestMatch: ClickUpTask | null = null;
  let bestScore = 0;

  for (const task of tasks) {
    const taskNorm = task.name.toLowerCase().trim();
    
    if (taskNorm === normalized) return task;
    if (taskNorm.includes(normalized) || normalized.includes(taskNorm)) {
      const score = Math.min(taskNorm.length, normalized.length) / Math.max(taskNorm.length, normalized.length);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = task;
      }
    }
  }

  return bestScore > 0.5 ? bestMatch : null;
}

export async function createTask(
  listId: string,
  options: { name: string; description?: string; status?: TaskStatus; priority?: TaskPriority; tags?: string[] }
): Promise<ClickUpTask> {
  const data = await request<any>(`https://api.clickup.com/api/v2/list/${listId}/task`, {
    method: 'POST',
    body: JSON.stringify({
      name: options.name,
      description: options.description || '',
      priority: options.priority,
      tags: options.tags || [],
      status: options.status || 'TO DO',
    }),
  });

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    status: data.status?.status?.toUpperCase() as TaskStatus,
    priority: data.priority?.id as TaskPriority,
    url: data.url,
    listId,
  };
}

export async function updateTask(
  taskId: string,
  options: { name?: string; description?: string; status?: TaskStatus; priority?: TaskPriority }
): Promise<ClickUpTask> {
  const body: any = {};
  if (options.name !== undefined) body.name = options.name;
  if (options.description !== undefined) body.description = options.description;
  if (options.status !== undefined) body.status = options.status;
  if (options.priority !== undefined) body.priority = options.priority;

  const data = await request<any>(`https://api.clickup.com/api/v2/task/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    status: data.status?.status?.toUpperCase() as TaskStatus,
    priority: data.priority?.id as TaskPriority,
    url: data.url,
  };
}

export async function setStatus(taskId: string, status: TaskStatus): Promise<ClickUpTask> {
  return updateTask(taskId, { status });
}

export async function addComment(taskId: string, comment: string): Promise<void> {
  await request(`https://api.clickup.com/api/v2/task/${taskId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ comment_text: comment }),
  });
}

export async function markDone(taskName: string, comment?: string): Promise<boolean> {
  const task = await findTaskFuzzy(taskName);
  if (!task) return false;
  await setStatus(task.id, 'DONE');
  if (comment) await addComment(task.id, `✅ ${new Date().toLocaleDateString()}\n\n${comment}`);
  return true;
}

export async function markInProgress(taskName: string, comment?: string): Promise<boolean> {
  const task = await findTaskFuzzy(taskName);
  if (!task) return false;
  await setStatus(task.id, 'DOING');
  if (comment) await addComment(task.id, `🔄 ${new Date().toLocaleDateString()}\n\n${comment}`);
  return true;
}

export function isConfigured(): boolean {
  try {
    getApiKey();
    const config = getConfig();
    return !!config.folderId;
  } catch {
    return false;
  }
}
