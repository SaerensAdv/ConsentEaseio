import { execSync } from 'child_process';
import * as sync from './sync';
import * as queue from './queue';
import { isConfigured } from './client';

export function getCurrentBranch(): string | null {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

export function getLastCommitMessage(): string | null {
  try {
    return execSync('git log -1 --pretty=%B', { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

export function getLastCommitHash(): string | null {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

export function getLastCommitAuthor(): string | null {
  try {
    return execSync('git log -1 --pretty=%an', { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

export async function onPostCommit(): Promise<void> {
  const message = getLastCommitMessage();
  if (!message) return;

  const result = await sync.processCommit({
    message,
    hash: getLastCommitHash() || undefined,
    branch: getCurrentBranch() || undefined,
    author: getLastCommitAuthor() || undefined,
  });

  if (result.updated.length > 0) {
    console.log(`✅ ClickUp: Updated ${result.updated.length} task(s)`);
  }
  if (result.errors.length > 0) {
    console.log(`⚠️ ClickUp: ${result.errors.length} error(s)`);
  }
}

export async function onPush(): Promise<void> {
  if (!isConfigured()) {
    console.log('⚠️ ClickUp not configured, skipping sync');
    return;
  }

  const pending = queue.getUnprocessedCount();
  if (pending > 0) {
    console.log(`🔄 ClickUp: Processing up to 25 of ${pending} queued event(s)...`);
    const result = await sync.processQueue({ maxEvents: 25, maxDurationMs: 5000 });
    console.log(`✅ ClickUp: Queue pass finished (${result.updated.length} updated, ${result.errors.length} errors)`);
  }
}

export function installGitHooks(): void {
  const fs = require('fs');
  const path = require('path');

  const hooksDir = path.join(process.cwd(), '.git', 'hooks');

  if (!fs.existsSync(hooksDir)) {
    console.log('⚠️ .git/hooks directory not found');
    return;
  }

  // Git lifecycle commands must never depend on ClickUp or network health.
  // Run automation detached, silence its output, and always let Git continue.
  const postCommitHook = `#!/bin/sh
(npx tsx -e "require('./packages/clickup-automation').onPostCommit()" >/dev/null 2>&1 &) || true
exit 0
`;

  const prePushHook = `#!/bin/sh
(npx tsx -e "require('./packages/clickup-automation').onPush()" >/dev/null 2>&1 &) || true
exit 0
`;

  fs.writeFileSync(path.join(hooksDir, 'post-commit'), postCommitHook);
  fs.chmodSync(path.join(hooksDir, 'post-commit'), '755');

  fs.writeFileSync(path.join(hooksDir, 'pre-push'), prePushHook);
  fs.chmodSync(path.join(hooksDir, 'pre-push'), '755');

  console.log('✅ Non-blocking Git hooks installed');
}

export function uninstallGitHooks(): void {
  const fs = require('fs');
  const path = require('path');

  const hooksDir = path.join(process.cwd(), '.git', 'hooks');

  try {
    fs.unlinkSync(path.join(hooksDir, 'post-commit'));
    fs.unlinkSync(path.join(hooksDir, 'pre-push'));
    console.log('✅ Git hooks removed');
  } catch {
    console.log('⚠️ No hooks to remove');
  }
}
