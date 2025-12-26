const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY;
const FOLDER_ID = '901512713527';

interface TaskUpdate {
  name: string;
  status: 'DONE' | 'COMPLETE' | 'DOING' | 'TO DO';
  comment?: string;
}

const completedTasks: TaskUpdate[] = [
  { name: "Privacy Policy pagina", status: "DONE", comment: "Implemented at /privacy with full GDPR/CCPA content" },
  { name: "Terms of Service pagina", status: "DONE", comment: "Implemented at /terms with platform terms" },
  { name: "Cookie Policy pagina", status: "DONE", comment: "Implemented at /cookies with cookie usage info" },
  { name: "FAQ pagina", status: "DONE", comment: "Implemented at /faq with accordion component" },
  { name: "Contact pagina", status: "DONE", comment: "Implemented at /contact with form and support info" },
  { name: "Documentatie/Help Center", status: "DONE", comment: "Implemented at /docs with tabbed setup guides" },
  { name: "Wachtwoord vergeten flow", status: "DONE", comment: "Password reset with secure tokens, email delivery via Resend, 1-hour expiry" },
  { name: "Email verificatie", status: "DONE", comment: "Email verification with tokens, 24-hour expiry, verification page" },
  { name: "Rate limiting implementeren", status: "DONE", comment: "Rate limiting on auth (10/15min), password reset (5/hour), API (100/min), contact (5/hour)" },
  { name: "Gratis proefperiode implementatie", status: "DONE", comment: "7-day trial configured in Stripe for Solo plan" },
];

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
  const data = await makeRequest(`https://api.clickup.com/api/v2/list/${listId}/task?include_closed=true`);
  return data.tasks || [];
}

async function updateTaskStatus(taskId: string, status: string) {
  const data = await makeRequest(`https://api.clickup.com/api/v2/task/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  return data;
}

async function addComment(taskId: string, comment: string) {
  const data = await makeRequest(`https://api.clickup.com/api/v2/task/${taskId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ comment_text: comment }),
  });
  return data;
}

function normalizeTaskName(name: string): string {
  return name.toLowerCase().trim();
}

async function main() {
  if (!CLICKUP_API_KEY) {
    console.error('CLICKUP_API_KEY is not set');
    process.exit(1);
  }

  console.log('🔄 Syncing ConsentEase progress to ClickUp...\n');

  const lists = await getListsInFolder(FOLDER_ID);
  console.log(`Found ${lists.length} lists\n`);

  const taskUpdatesMap = new Map<string, TaskUpdate>();
  for (const update of completedTasks) {
    taskUpdatesMap.set(normalizeTaskName(update.name), update);
  }

  let updatedCount = 0;
  let notFoundCount = 0;
  const foundTasks = new Set<string>();

  for (const list of lists) {
    console.log(`\n📋 Checking list: ${list.name}`);
    
    const tasks = await getTasksInList(list.id);

    for (const task of tasks) {
      const normalizedName = normalizeTaskName(task.name);
      const update = taskUpdatesMap.get(normalizedName);
      
      if (update) {
        foundTasks.add(normalizedName);
        const currentStatus = task.status?.status?.toUpperCase() || '';
        
        if (currentStatus === update.status) {
          console.log(`  ⏭️  Already ${update.status}: ${task.name}`);
          continue;
        }

        try {
          await updateTaskStatus(task.id, update.status);
          console.log(`  ✅ Updated to ${update.status}: ${task.name}`);
          
          if (update.comment) {
            await addComment(task.id, `✅ Completed on ${new Date().toLocaleDateString('nl-BE')}\n\n${update.comment}`);
            console.log(`     💬 Added completion comment`);
          }
          
          updatedCount++;
          await new Promise(resolve => setTimeout(resolve, 150));
        } catch (error) {
          console.error(`  ❌ Failed to update: ${task.name}`, error);
        }
      }
    }
  }

  for (const update of completedTasks) {
    if (!foundTasks.has(normalizeTaskName(update.name))) {
      console.log(`\n⚠️  Task not found in ClickUp: ${update.name}`);
      notFoundCount++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Updated ${updatedCount} tasks to completed status`);
  if (notFoundCount > 0) {
    console.log(`⚠️  ${notFoundCount} tasks were not found in ClickUp`);
  }
  console.log(`${'='.repeat(50)}`);
}

main().catch(console.error);
