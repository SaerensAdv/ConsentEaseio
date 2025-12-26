#!/usr/bin/env node
import * as client from './client';
import * as sync from './sync';
import * as queue from './queue';
import * as hooks from './hooks';
import { loadConfig, saveConfig, getConfig } from './config';
import type { TaskStatus, ClickUpConfig } from './types';

const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  switch (command) {
    case 'init':
      await initConfig();
      break;
    case 'install':
      hooks.installGitHooks();
      break;
    case 'uninstall':
      hooks.uninstallGitHooks();
      break;
    case 'lists':
      await listLists();
      break;
    case 'tasks':
      await listTasks(args[0]);
      break;
    case 'add':
      await addTask(args);
      break;
    case 'done':
      await markDone(args[0], args.slice(1).join(' '));
      break;
    case 'doing':
      await markDoing(args[0], args.slice(1).join(' '));
      break;
    case 'waiting':
      await markWaiting(args[0], args.slice(1).join(' '));
      break;
    case 'status':
      await changeStatus(args[0], args[1] as TaskStatus);
      break;
    case 'comment':
      await addComment(args[0], args.slice(1).join(' '));
      break;
    case 'find':
      await findTask(args.join(' '));
      break;
    case 'queue':
      showQueue();
      break;
    case 'process':
      await processQueue();
      break;
    case 'commit':
      await processCommit(args.join(' '));
      break;
    case 'help':
    default:
      showHelp();
  }
}

function showHelp() {
  console.log(`
ClickUp Automation CLI
======================

Setup:
  init                           Create config file
  install                        Install git hooks
  uninstall                      Remove git hooks

Tasks:
  lists                          List all lists
  tasks [filter]                 List tasks
  add <list> <name> [desc]       Add a new task
  find <name>                    Find a task by name

Status:
  done <task> [comment]          Mark task as DONE
  doing <task> [comment]         Mark task as DOING
  waiting <task> [comment]       Mark task as WAITING
  status <task> <status>         Set specific status
  comment <task> <text>          Add a comment

Queue:
  queue                          Show pending events
  process                        Process event queue

Git:
  commit <message>               Process a commit message

Commit Prefixes:
  feat: [Task] message           Mark task as DOING
  fix: [Task] message            Mark task as DOING  
  done: [Task] message           Mark task as DONE
  close: [Task] message          Mark task as DONE
  wip: [Task] message            Mark task as DOING

Examples:
  clickup done "Email verificatie" "Implemented with Resend"
  clickup doing "Rate limiting"
  clickup commit "feat: [Email verificatie] Add password reset flow"
`);
}

async function initConfig() {
  const config: ClickUpConfig = {
    folderId: args[0] || '',
    defaultList: 'Backlog',
    commitRules: [
      { prefix: 'feat:', status: 'DOING', commentTemplate: '🚀 Started: {{message}}' },
      { prefix: 'fix:', status: 'DOING', commentTemplate: '🔧 Fix: {{message}}' },
      { prefix: 'done:', status: 'DONE', commentTemplate: '✅ Completed: {{message}}' },
      { prefix: 'close:', status: 'DONE', commentTemplate: '✅ Closed: {{message}}' },
    ],
    taskMappings: [],
    branchPatterns: [
      { pattern: 'feature/(.+)', extractTaskName: true },
      { pattern: 'fix/(.+)', extractTaskName: true },
    ],
    autoSync: { enabled: true, intervalMs: 60000 },
  };

  saveConfig(config);
  console.log('✅ Created clickup-automation.config.json');
  
  if (!args[0]) {
    console.log('⚠️ Remember to set folderId in the config file');
  }
}

async function listLists() {
  if (!client.isConfigured()) {
    console.error('❌ Not configured. Run: clickup init <folderId>');
    return;
  }
  
  console.log('📋 Lists:\n');
  const lists = await client.getLists();
  for (const list of lists) {
    console.log(`  - ${list.name} (${list.id})`);
  }
}

async function listTasks(filter?: string) {
  const tasks = await client.getAllTasks();
  const filtered = filter 
    ? tasks.filter(t => t.listName?.toLowerCase().includes(filter.toLowerCase()) || 
                       t.name.toLowerCase().includes(filter.toLowerCase()))
    : tasks;

  const byList = new Map<string, typeof tasks>();
  for (const task of filtered) {
    const list = task.listName || 'Unknown';
    if (!byList.has(list)) byList.set(list, []);
    byList.get(list)!.push(task);
  }

  for (const [list, listTasks] of byList) {
    console.log(`\n📁 ${list}`);
    for (const task of listTasks) {
      const icon = task.status === 'DONE' ? '✅' : task.status === 'DOING' ? '🔄' : '⬜';
      console.log(`  ${icon} ${task.name} [${task.status}]`);
    }
  }
  console.log(`\nTotal: ${filtered.length} tasks`);
}

async function addTask(taskArgs: string[]) {
  const [listName, name, description] = taskArgs;
  if (!listName || !name) {
    console.error('Usage: add <list> <name> [description]');
    return;
  }

  const list = await client.getOrCreateList(listName);
  const task = await client.createTask(list.id, { name, description });
  console.log(`✅ Created: ${task.name}`);
  console.log(`   URL: ${task.url}`);
}

async function markDone(taskName: string, comment?: string) {
  if (!taskName) {
    console.error('Usage: done <task-name> [comment]');
    return;
  }
  const success = await sync.done(taskName, comment || undefined);
  console.log(success ? `✅ Marked "${taskName}" as DONE` : `❌ Task not found: ${taskName}`);
}

async function markDoing(taskName: string, comment?: string) {
  if (!taskName) {
    console.error('Usage: doing <task-name> [comment]');
    return;
  }
  const success = await sync.doing(taskName, comment || undefined);
  console.log(success ? `🔄 Marked "${taskName}" as DOING` : `❌ Task not found: ${taskName}`);
}

async function markWaiting(taskName: string, comment?: string) {
  if (!taskName) {
    console.error('Usage: waiting <task-name> [comment]');
    return;
  }
  const success = await sync.waiting(taskName, comment || undefined);
  console.log(success ? `⏸️ Marked "${taskName}" as WAITING` : `❌ Task not found: ${taskName}`);
}

async function changeStatus(taskName: string, status: TaskStatus) {
  if (!taskName || !status) {
    console.error('Usage: status <task-name> <status>');
    return;
  }
  const success = await sync.syncTask(taskName, status);
  console.log(success ? `✅ Updated "${taskName}" to ${status}` : `❌ Task not found`);
}

async function addComment(taskName: string, comment: string) {
  if (!taskName || !comment) {
    console.error('Usage: comment <task-name> <text>');
    return;
  }
  const task = await client.findTaskFuzzy(taskName);
  if (!task) {
    console.error(`❌ Task not found: ${taskName}`);
    return;
  }
  await client.addComment(task.id, comment);
  console.log(`💬 Added comment to "${task.name}"`);
}

async function findTask(name: string) {
  if (!name) {
    console.error('Usage: find <task-name>');
    return;
  }
  const task = await client.findTaskFuzzy(name);
  if (task) {
    console.log(`\n📋 Found: ${task.name}`);
    console.log(`   Status: ${task.status}`);
    console.log(`   List: ${task.listName}`);
    console.log(`   URL: ${task.url}`);
  } else {
    console.log(`❌ Not found: ${name}`);
  }
}

function showQueue() {
  const events = queue.loadQueue();
  const pending = events.filter(e => !e.processed);
  console.log(`\n📥 Queue: ${pending.length} pending event(s)\n`);
  for (const event of pending) {
    console.log(`  - [${event.type}] ${event.taskName || event.taskId} → ${event.status || 'N/A'}`);
  }
}

async function processQueue() {
  const count = queue.getUnprocessedCount();
  if (count === 0) {
    console.log('✅ Queue is empty');
    return;
  }
  console.log(`🔄 Processing ${count} event(s)...`);
  const result = await sync.processQueue();
  console.log(`✅ Done: ${result.updated.length} updated, ${result.errors.length} errors`);
}

async function processCommit(message: string) {
  if (!message) {
    console.error('Usage: commit <message>');
    return;
  }
  const result = await sync.processCommit({ 
    message, 
    branch: hooks.getCurrentBranch() || undefined 
  });
  if (result.updated.length > 0) {
    console.log(`✅ Updated: ${result.updated.join(', ')}`);
  } else {
    console.log('ℹ️ No matching tasks found in commit message');
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
