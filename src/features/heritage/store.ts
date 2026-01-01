import fs from 'fs/promises';
import path from 'path';
import { Artifact } from './types';

const HERITAGE_DIR_NAME = 'heritage';

export async function ensureHeritageDir(baseDir: string) {
  const dir = path.join(baseDir, HERITAGE_DIR_NAME);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function saveArtifact(baseDir: string, artifact: Artifact) {
  const dir = await ensureHeritageDir(baseDir);
  const filename = path.join(dir, `${artifact.id}.json`);
  await fs.writeFile(filename, JSON.stringify(artifact, null, 2), 'utf-8');
  return filename;
}

export async function listArtifacts(baseDir: string): Promise<Artifact[]> {
  const dir = await ensureHeritageDir(baseDir);
  try {
    const files = await fs.readdir(dir);
    const artifacts: Artifact[] = [];
    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      const raw = await fs.readFile(path.join(dir, f), 'utf-8');
      artifacts.push(JSON.parse(raw));
    }
    return artifacts;
  } catch (err) {
    return [];
  }
}

export async function queryArtifacts(baseDir: string, opts: { tag?: string; model?: string }) {
  const all = await listArtifacts(baseDir);
  return all.filter((a) => {
    if (opts.tag && !a.tags.includes(opts.tag)) return false;
    if (opts.model && a.model !== opts.model) return false;
    return true;
  });
}
