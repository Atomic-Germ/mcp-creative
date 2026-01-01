import fs from 'fs/promises';
import path from 'path';

const STAGING_DIR_NAME = 'staging-embeddings';

export async function ensureStagingDir(baseDir: string) {
  const dir = path.join(baseDir, STAGING_DIR_NAME);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function addStagingEntry(baseDir: string, artifactId: string, model: string) {
  const dir = await ensureStagingDir(baseDir);
  const filename = path.join(dir, `${artifactId}-${model}.json`);
  const entry = { artifactId, model, timestamp: new Date().toISOString() };
  await fs.writeFile(filename, JSON.stringify(entry, null, 2), 'utf-8');
  return filename;
}

export async function listStagingEntries(baseDir: string) {
  const dir = await ensureStagingDir(baseDir);
  try {
    const files = await fs.readdir(dir);
    const entries = [] as any[];
    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      const raw = await fs.readFile(path.join(dir, f), 'utf-8');
      entries.push(JSON.parse(raw));
    }
    return entries;
  } catch (err) {
    return [];
  }
}

export async function removeStagingEntry(baseDir: string, artifactId: string, model: string) {
  const dir = await ensureStagingDir(baseDir);
  const filename = path.join(dir, `${artifactId}-${model}.json`);
  try {
    await fs.unlink(filename);
  } catch (err) {
    // ignore
  }
}
