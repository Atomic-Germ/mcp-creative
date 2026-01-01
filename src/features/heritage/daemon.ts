import { processStagedEmbeddings } from './processing.js';

let intervalId: NodeJS.Timeout | null = null;
let currentConfig: { baseDir?: string; intervalMs?: number; model?: string; forceFallback?: boolean } | null = null;

export function isSleepDaemonRunning() {
  return intervalId !== null;
}

export function getSleepDaemonConfig() {
  return currentConfig;
}

export function startSleepDaemon(baseDir: string, opts?: { intervalMs?: number; model?: string; forceFallback?: boolean }) {
  const intervalMs = opts?.intervalMs || 60_000; // default to 60s for safety
  const model = opts?.model;
  const forceFallback = !!opts?.forceFallback;

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  currentConfig = { baseDir, intervalMs, model, forceFallback };

  intervalId = setInterval(async () => {
    try {
      await processStagedEmbeddings(baseDir, { force_fallback: forceFallback, model });
    } catch (err) {
      console.error('sleep daemon processing failed:', err);
    }
  }, intervalMs);

  return currentConfig;
}

export function stopSleepDaemon() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  currentConfig = null;
}
