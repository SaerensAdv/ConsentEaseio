const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY;
const FOLDER_ID = '901512713527';

export type TaskStatus = 'TO DO' | 'DOING' | 'WAITING' | 'READY TO PUBLISH' | 'DONE' | 'COMPLETE';
export type TaskPriority = 1 | 2 | 3 | 4; // 1=urgent, 2=high, 3=normal, 4=low

export interface ClickUpTask {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
  listName?: string;
  listId?: string;
  url?: string;
}

export interface CreateTaskOptions {
  name: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
}

export interface UpdateTaskOptions {
  name?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

async function makeRequest<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  if (!CLICKUP_API_KEY) {
    throw new Error('CLICKUP_API_KEY is not configured');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': CLICKUP_API_KEY,
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

export async function getLists(): Promise<{ id: string; name: string }[]> {
  const data = await makeRequest<{ lists: any[] }>(`https://api.clickup.com/api/v2/folder/${FOLDER_ID}/list`);
  return data.lists.map(list => ({ id: list.id, name: list.name }));
}

export async function getListByName(name: string): Promise<{ id: string; name: string } | null> {
  const lists = await getLists();
  return lists.find(l => l.name.toLowerCase() === name.toLowerCase()) || null;
}

export async function createList(name: string): Promise<{ id: string; name: string }> {
  const data = await makeRequest<any>(`https://api.clickup.com/api/v2/folder/${FOLDER_ID}/list`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return { id: data.id, name: data.name };
}

export async function getOrCreateList(name: string): Promise<{ id: string; name: string }> {
  const existing = await getListByName(name);
  if (existing) return existing;
  return createList(name);
}

export async function getTasksInList(listId: string, includeClosed = true): Promise<ClickUpTask[]> {
  const data = await makeRequest<{ tasks: any[] }>(
    `https://api.clickup.com/api/v2/list/${listId}/task?include_closed=${includeClosed}`
  );
  
  return data.tasks.map(task => ({
    id: task.id,
    name: task.name,
    description: task.description,
    status: task.status?.status?.toUpperCase() as TaskStatus,
    priority: task.priority?.id as TaskPriority,
    tags: task.tags?.map((t: any) => t.name) || [],
    url: task.url,
  }));
}

export async function getAllTasks(includeClosed = true): Promise<ClickUpTask[]> {
  const lists = await getLists();
  const allTasks: ClickUpTask[] = [];

  for (const list of lists) {
    const tasks = await getTasksInList(list.id, includeClosed);
    for (const task of tasks) {
      task.listName = list.name;
      task.listId = list.id;
      allTasks.push(task);
    }
    await delay(100);
  }

  return allTasks;
}

export async function findTaskByName(name: string): Promise<ClickUpTask | null> {
  const tasks = await getAllTasks();
  const normalized = name.toLowerCase().trim();
  return tasks.find(t => t.name.toLowerCase().trim() === normalized) || null;
}

export async function createTask(listId: string, options: CreateTaskOptions): Promise<ClickUpTask> {
  const data = await makeRequest<any>(`https://api.clickup.com/api/v2/list/${listId}/task`, {
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
    tags: data.tags?.map((t: any) => t.name) || [],
    url: data.url,
    listId,
  };
}

export async function updateTask(taskId: string, options: UpdateTaskOptions): Promise<ClickUpTask> {
  const body: any = {};
  if (options.name !== undefined) body.name = options.name;
  if (options.description !== undefined) body.description = options.description;
  if (options.status !== undefined) body.status = options.status;
  if (options.priority !== undefined) body.priority = options.priority;

  const data = await makeRequest<any>(`https://api.clickup.com/api/v2/task/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    status: data.status?.status?.toUpperCase() as TaskStatus,
    priority: data.priority?.id as TaskPriority,
    tags: data.tags?.map((t: any) => t.name) || [],
    url: data.url,
  };
}

export async function setTaskStatus(taskId: string, status: TaskStatus): Promise<ClickUpTask> {
  return updateTask(taskId, { status });
}

export async function addComment(taskId: string, comment: string): Promise<void> {
  await makeRequest(`https://api.clickup.com/api/v2/task/${taskId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ comment_text: comment }),
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  await makeRequest(`https://api.clickup.com/api/v2/task/${taskId}`, {
    method: 'DELETE',
  });
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface SyncResult {
  created: string[];
  updated: string[];
  skipped: string[];
  errors: { task: string; error: string }[];
}

export interface TaskSync {
  name: string;
  list: string;
  status?: TaskStatus;
  description?: string;
  priority?: TaskPriority;
  tags?: string[];
  comment?: string;
}

export async function syncTasks(tasks: TaskSync[]): Promise<SyncResult> {
  const result: SyncResult = { created: [], updated: [], skipped: [], errors: [] };
  
  const existingTasks = await getAllTasks();
  const taskMap = new Map<string, ClickUpTask>();
  for (const task of existingTasks) {
    taskMap.set(task.name.toLowerCase().trim(), task);
  }

  const listCache = new Map<string, string>();

  for (const taskSync of tasks) {
    try {
      const normalized = taskSync.name.toLowerCase().trim();
      const existing = taskMap.get(normalized);

      if (existing) {
        const needsUpdate = 
          (taskSync.status && existing.status !== taskSync.status) ||
          (taskSync.description && existing.description !== taskSync.description) ||
          (taskSync.priority && existing.priority !== taskSync.priority);

        if (needsUpdate) {
          await updateTask(existing.id, {
            status: taskSync.status,
            description: taskSync.description,
            priority: taskSync.priority,
          });
          result.updated.push(taskSync.name);

          if (taskSync.comment) {
            await addComment(existing.id, taskSync.comment);
          }
        } else {
          result.skipped.push(taskSync.name);
        }
      } else {
        let listId = listCache.get(taskSync.list);
        if (!listId) {
          const list = await getOrCreateList(taskSync.list);
          listId = list.id;
          listCache.set(taskSync.list, listId);
        }

        const newTask = await createTask(listId, {
          name: taskSync.name,
          description: taskSync.description,
          status: taskSync.status || 'TO DO',
          priority: taskSync.priority,
          tags: taskSync.tags,
        });
        result.created.push(taskSync.name);

        if (taskSync.comment) {
          await addComment(newTask.id, taskSync.comment);
        }
      }

      await delay(150);
    } catch (error) {
      result.errors.push({ 
        task: taskSync.name, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  return result;
}

export async function markTaskDone(taskName: string, comment?: string): Promise<boolean> {
  const task = await findTaskByName(taskName);
  if (!task) return false;

  await setTaskStatus(task.id, 'DONE');
  if (comment) {
    await addComment(task.id, `✅ ${new Date().toLocaleDateString('nl-BE')}\n\n${comment}`);
  }
  return true;
}

export async function markTaskInProgress(taskName: string, comment?: string): Promise<boolean> {
  const task = await findTaskByName(taskName);
  if (!task) return false;

  await setTaskStatus(task.id, 'DOING');
  if (comment) {
    await addComment(task.id, `🔄 Started: ${new Date().toLocaleDateString('nl-BE')}\n\n${comment}`);
  }
  return true;
}

export function isConfigured(): boolean {
  return !!CLICKUP_API_KEY;
}
