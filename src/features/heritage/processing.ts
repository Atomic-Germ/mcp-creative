import { listStagingEntries, removeStagingEntry } from './staging.js';
import { listArtifacts } from './store.js';
import { embedText } from './embeddings.js';
import path from 'path';
import fs from 'fs/promises';

export async function processStagedEmbeddings(baseDir: string, opts?: { force_fallback?: boolean; model?: string }) {
  const staged = await listStagingEntries(baseDir);
  const processed: { artifactId: string; model: string; success: boolean }[] = [];

  for (const s of staged) {
    const artifactId = s.artifactId as string;
    const model = s.model as string;
    const heritageDir = path.join(baseDir, 'heritage');
    const filename = path.join(heritageDir, `${artifactId}.json`);
    try {
      const raw = await fs.readFile(filename, 'utf-8');
      const art = JSON.parse(raw);
      const text = (art.content || []).map((c:any) => c.data).join('\n');
      const emb = opts?.force_fallback ? await embedText(undefined, text) : await embedText(model, text);
      if (!art.metadata) art.metadata = {};
      if (!art.metadata.embeddings) art.metadata.embeddings = {};
      art.metadata.embeddings[model] = emb;
      art.metadata.embeddingModels = Object.keys(art.metadata.embeddings || {});
      await fs.writeFile(filename, JSON.stringify(art, null, 2), 'utf-8');
      await removeStagingEntry(baseDir, artifactId, model);
      processed.push({ artifactId, model, success: true });
    } catch (err) {
      processed.push({ artifactId, model, success: false });
    }
  }

  return processed;
}
