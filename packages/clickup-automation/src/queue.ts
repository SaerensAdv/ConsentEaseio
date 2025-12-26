import * as fs from 'fs';
import * as path from 'path';
import type { TaskEvent } from './types';

const QUEUE_FILE = '.clickup-queue.json';

function getQueuePath(): string {
  return path.join(process.cwd(), QUEUE_FILE);
}

export function loadQueue(): TaskEvent[] {
  try {
    const queuePath = getQueuePath();
    if (fs.existsSync(queuePath)) {
      return JSON.parse(fs.readFileSync(queuePath, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load queue:', e);
  }
  return [];
}

export function saveQueue(events: TaskEvent[]): void {
  fs.writeFileSync(getQueuePath(), JSON.stringify(events, null, 2));
}

export function enqueue(event: Omit<TaskEvent, 'id' | 'timestamp' | 'processed'>): void {
  const events = loadQueue();
  events.push({
    ...event,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    processed: false,
  });
  saveQueue(events);
}

export function dequeue(): TaskEvent | null {
  const events = loadQueue();
  const unprocessed = events.find(e => !e.processed);
  return unprocessed || null;
}

export function markProcessed(eventId: string): void {
  const events = loadQueue();
  const event = events.find(e => e.id === eventId);
  if (event) {
    event.processed = true;
    saveQueue(events);
  }
}

export function getUnprocessedCount(): number {
  return loadQueue().filter(e => !e.processed).length;
}

export function clearProcessed(): void {
  const events = loadQueue().filter(e => !e.processed);
  saveQueue(events);
}

export function clearAll(): void {
  saveQueue([]);
}
