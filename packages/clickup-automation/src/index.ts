export * from './types';
export * from './config';
export * as client from './client';
export * as queue from './queue';
export * as sync from './sync';
export * as hooks from './hooks';

export { 
  getLists,
  getListByName,
  createList,
  getOrCreateList,
  getAllTasks,
  findTask,
  findTaskFuzzy,
  createTask,
  updateTask,
  setStatus,
  addComment,
  markDone,
  markInProgress,
  isConfigured,
} from './client';

export {
  processCommit,
  processQueue,
  syncTask,
  done,
  doing,
  waiting,
} from './sync';

export {
  onPostCommit,
  onPush,
  installGitHooks,
  uninstallGitHooks,
  getCurrentBranch,
  getLastCommitMessage,
} from './hooks';

export {
  enqueue,
  dequeue,
  getUnprocessedCount,
  clearProcessed,
  clearAll as clearQueue,
} from './queue';

export {
  loadConfig,
  saveConfig,
  getConfig,
} from './config';
