const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY;
const FOLDER_ID = '901512713527';

async function makeRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': CLICKUP_API_KEY!,
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

async function getListsInFolder(folderId: string) {
  const data = await makeRequest(`https://api.clickup.com/api/v2/folder/${folderId}/list`);
  return data.lists;
}

async function getTasksInList(listId: string) {
  const data = await makeRequest(`https://api.clickup.com/api/v2/list/${listId}/task`);
  return data.tasks || [];
}

async function updateTaskStatus(taskId: string, status: string) {
  const data = await makeRequest(`https://api.clickup.com/api/v2/task/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  return data;
}

async function main() {
  if (!CLICKUP_API_KEY) {
    console.error('CLICKUP_API_KEY is not set');
    process.exit(1);
  }

  console.log('🔄 Updating task statuses in ClickUp...\n');

  const lists = await getListsInFolder(FOLDER_ID);
  console.log(`Found ${lists.length} lists\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const list of lists) {
    console.log(`\n📋 Processing list: ${list.name}`);
    
    const tasks = await getTasksInList(list.id);
    console.log(`  Found ${tasks.length} tasks`);

    for (const task of tasks) {
      const currentStatus = task.status?.status?.toUpperCase() || '';
      
      if (currentStatus === 'TO DO') {
        skippedCount++;
        continue;
      }

      try {
        await updateTaskStatus(task.id, 'TO DO');
        updatedCount++;
        console.log(`  ✅ Updated: ${task.name}`);
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`  ❌ Failed to update: ${task.name}`, error);
      }
    }
  }

  console.log(`\n✅ Done! Updated ${updatedCount} tasks, skipped ${skippedCount} tasks.`);
}

main().catch(console.error);
