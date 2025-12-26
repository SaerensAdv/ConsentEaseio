import * as clickup from '../server/clickup';

const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  if (!clickup.isConfigured()) {
    console.error('❌ CLICKUP_API_KEY is not set');
    process.exit(1);
  }

  switch (command) {
    case 'lists':
      await listLists();
      break;

    case 'tasks':
      await listTasks(args[0]);
      break;

    case 'add':
      await addTask(args);
      break;

    case 'status':
      await changeStatus(args[0], args[1] as clickup.TaskStatus);
      break;

    case 'done':
      await markDone(args[0], args.slice(1).join(' '));
      break;

    case 'doing':
      await markDoing(args[0], args.slice(1).join(' '));
      break;

    case 'comment':
      await addComment(args[0], args.slice(1).join(' '));
      break;

    case 'find':
      await findTask(args.join(' '));
      break;

    case 'sync':
      await syncFromFile(args[0]);
      break;

    case 'help':
    default:
      showHelp();
  }
}

function showHelp() {
  console.log(`
ClickUp CLI for ConsentEase
===========================

Commands:
  lists                          List all lists in the folder
  tasks [list-name]              List tasks (optionally filter by list)
  add <list> <name> [desc]       Add a new task
  status <task-name> <status>    Change task status
  done <task-name> [comment]     Mark task as DONE
  doing <task-name> [comment]    Mark task as DOING
  comment <task-name> <text>     Add a comment to a task
  find <task-name>               Find a task by name
  sync <file.json>               Sync tasks from JSON file

Statuses: TO DO, DOING, WAITING, READY TO PUBLISH, DONE, COMPLETE

Examples:
  npx tsx scripts/clickup-cli.ts lists
  npx tsx scripts/clickup-cli.ts tasks "Public Pages"
  npx tsx scripts/clickup-cli.ts add "Tech Debt" "Fix memory leak" "Description here"
  npx tsx scripts/clickup-cli.ts done "Email verificatie" "Implemented with Resend"
  npx tsx scripts/clickup-cli.ts status "API docs" "DOING"
`);
}

async function listLists() {
  console.log('📋 Lists in ConsentEase folder:\n');
  const lists = await clickup.getLists();
  for (const list of lists) {
    console.log(`  - ${list.name} (${list.id})`);
  }
}

async function listTasks(listFilter?: string) {
  console.log('📋 Tasks:\n');
  const tasks = await clickup.getAllTasks();
  
  const filtered = listFilter 
    ? tasks.filter(t => t.listName?.toLowerCase().includes(listFilter.toLowerCase()))
    : tasks;

  const byList = new Map<string, clickup.ClickUpTask[]>();
  for (const task of filtered) {
    const listName = task.listName || 'Unknown';
    if (!byList.has(listName)) byList.set(listName, []);
    byList.get(listName)!.push(task);
  }

  for (const [listName, tasks] of byList) {
    console.log(`\n📁 ${listName}`);
    for (const task of tasks) {
      const statusIcon = getStatusIcon(task.status);
      console.log(`  ${statusIcon} ${task.name} [${task.status}]`);
    }
  }

  console.log(`\nTotal: ${filtered.length} tasks`);
}

function getStatusIcon(status: clickup.TaskStatus): string {
  switch (status) {
    case 'TO DO': return '⬜';
    case 'DOING': return '🔄';
    case 'WAITING': return '⏸️';
    case 'READY TO PUBLISH': return '🚀';
    case 'DONE': return '✅';
    case 'COMPLETE': return '📦';
    default: return '❓';
  }
}

async function addTask(args: string[]) {
  const [listName, name, description] = args;
  if (!listName || !name) {
    console.error('Usage: add <list> <name> [description]');
    process.exit(1);
  }

  const list = await clickup.getOrCreateList(listName);
  const task = await clickup.createTask(list.id, { name, description });
  console.log(`✅ Created task: ${task.name} in ${listName}`);
  console.log(`   URL: ${task.url}`);
}

async function changeStatus(taskName: string, status: clickup.TaskStatus) {
  if (!taskName || !status) {
    console.error('Usage: status <task-name> <status>');
    process.exit(1);
  }

  const task = await clickup.findTaskByName(taskName);
  if (!task) {
    console.error(`❌ Task not found: ${taskName}`);
    process.exit(1);
  }

  await clickup.setTaskStatus(task.id, status);
  console.log(`✅ Updated "${taskName}" to ${status}`);
}

async function markDone(taskName: string, comment?: string) {
  if (!taskName) {
    console.error('Usage: done <task-name> [comment]');
    process.exit(1);
  }

  const success = await clickup.markTaskDone(taskName, comment || undefined);
  if (success) {
    console.log(`✅ Marked "${taskName}" as DONE`);
    if (comment) console.log(`   Added comment: ${comment}`);
  } else {
    console.error(`❌ Task not found: ${taskName}`);
  }
}

async function markDoing(taskName: string, comment?: string) {
  if (!taskName) {
    console.error('Usage: doing <task-name> [comment]');
    process.exit(1);
  }

  const success = await clickup.markTaskInProgress(taskName, comment || undefined);
  if (success) {
    console.log(`🔄 Marked "${taskName}" as DOING`);
    if (comment) console.log(`   Added comment: ${comment}`);
  } else {
    console.error(`❌ Task not found: ${taskName}`);
  }
}

async function addComment(taskName: string, comment: string) {
  if (!taskName || !comment) {
    console.error('Usage: comment <task-name> <text>');
    process.exit(1);
  }

  const task = await clickup.findTaskByName(taskName);
  if (!task) {
    console.error(`❌ Task not found: ${taskName}`);
    process.exit(1);
  }

  await clickup.addComment(task.id, comment);
  console.log(`💬 Added comment to "${taskName}"`);
}

async function findTask(name: string) {
  if (!name) {
    console.error('Usage: find <task-name>');
    process.exit(1);
  }

  const task = await clickup.findTaskByName(name);
  if (task) {
    console.log(`\n📋 Found task:`);
    console.log(`   Name: ${task.name}`);
    console.log(`   Status: ${task.status}`);
    console.log(`   List: ${task.listName}`);
    console.log(`   Priority: ${task.priority || 'none'}`);
    console.log(`   URL: ${task.url}`);
    if (task.description) {
      console.log(`   Description: ${task.description.substring(0, 100)}...`);
    }
  } else {
    console.error(`❌ Task not found: ${name}`);
  }
}

async function syncFromFile(filePath: string) {
  if (!filePath) {
    console.error('Usage: sync <file.json>');
    console.error('\nJSON format: [{ "name": "Task", "list": "List Name", "status": "DONE", "comment": "..." }]');
    process.exit(1);
  }

  const fs = await import('fs');
  const content = fs.readFileSync(filePath, 'utf-8');
  const tasks: clickup.TaskSync[] = JSON.parse(content);

  console.log(`🔄 Syncing ${tasks.length} tasks...\n`);
  const result = await clickup.syncTasks(tasks);

  console.log(`\n${'='.repeat(40)}`);
  console.log(`✅ Created: ${result.created.length}`);
  console.log(`📝 Updated: ${result.updated.length}`);
  console.log(`⏭️  Skipped: ${result.skipped.length}`);
  if (result.errors.length > 0) {
    console.log(`❌ Errors: ${result.errors.length}`);
    for (const err of result.errors) {
      console.log(`   - ${err.task}: ${err.error}`);
    }
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
