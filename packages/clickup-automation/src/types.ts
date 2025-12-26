export type TaskStatus = 'TO DO' | 'DOING' | 'WAITING' | 'READY TO PUBLISH' | 'DONE' | 'COMPLETE';
export type TaskPriority = 1 | 2 | 3 | 4;

export interface TaskEvent {
  id: string;
  type: 'status_change' | 'comment' | 'create' | 'update';
  taskName?: string;
  taskId?: string;
  status?: TaskStatus;
  comment?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  processed: boolean;
}

export interface TaskMapping {
  pattern: string;
  taskName: string;
  list: string;
  onMatch?: {
    status?: TaskStatus;
    comment?: string;
  };
}

export interface CommitRule {
  prefix: string;
  status: TaskStatus;
  commentTemplate?: string;
}

export interface ClickUpConfig {
  folderId: string;
  defaultList?: string;
  commitRules: CommitRule[];
  taskMappings: TaskMapping[];
  branchPatterns?: {
    pattern: string;
    extractTaskName: boolean;
  }[];
  autoSync: {
    enabled: boolean;
    intervalMs?: number;
  };
}

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

export interface SyncResult {
  success: boolean;
  created: string[];
  updated: string[];
  errors: { task: string; error: string }[];
}
