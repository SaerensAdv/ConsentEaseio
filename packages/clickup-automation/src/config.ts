import * as fs from 'fs';
import * as path from 'path';
import type { ClickUpConfig } from './types';

const DEFAULT_CONFIG: ClickUpConfig = {
  folderId: '',
  defaultList: 'Backlog',
  commitRules: [
    { prefix: 'feat:', status: 'DOING', commentTemplate: '🚀 Started: {{message}}' },
    { prefix: 'fix:', status: 'DOING', commentTemplate: '🔧 Working on fix: {{message}}' },
    { prefix: 'done:', status: 'DONE', commentTemplate: '✅ Completed: {{message}}' },
    { prefix: 'close:', status: 'DONE', commentTemplate: '✅ Closed: {{message}}' },
    { prefix: 'wip:', status: 'DOING', commentTemplate: '🔄 Work in progress: {{message}}' },
  ],
  taskMappings: [],
  branchPatterns: [
    { pattern: 'feature/(.+)', extractTaskName: true },
    { pattern: 'fix/(.+)', extractTaskName: true },
    { pattern: 'task/(.+)', extractTaskName: true },
  ],
  autoSync: {
    enabled: true,
    intervalMs: 60000,
  },
};

let cachedConfig: ClickUpConfig | null = null;

export function loadConfig(configPath?: string): ClickUpConfig {
  if (cachedConfig) return cachedConfig;

  const searchPaths = configPath
    ? [configPath]
    : [
        'clickup-automation.config.json',
        'clickup-automation.config.js',
        '.clickup.json',
        path.join(process.cwd(), 'clickup-automation.config.json'),
      ];

  for (const searchPath of searchPaths) {
    try {
      if (fs.existsSync(searchPath)) {
        const content = fs.readFileSync(searchPath, 'utf-8');
        const userConfig = JSON.parse(content);
        const merged = { ...DEFAULT_CONFIG, ...userConfig };
        cachedConfig = merged;
        return merged;
      }
    } catch (e) {
      continue;
    }
  }

  cachedConfig = DEFAULT_CONFIG;
  return cachedConfig;
}

export function saveConfig(config: ClickUpConfig, configPath = 'clickup-automation.config.json'): void {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  cachedConfig = config;
}

export function getConfig(): ClickUpConfig {
  return cachedConfig || loadConfig();
}

export function clearConfigCache(): void {
  cachedConfig = null;
}
