import express from 'express';
import path from 'path';
import { semanticSearch, indexArtifacts } from '../features/heritage/embeddings.js';
import { listArtifacts } from '../features/heritage/store.js';
import { processStagedEmbeddings } from '../features/heritage/processing.js';
import { startSleepDaemon, stopSleepDaemon, isSleepDaemonRunning, getSleepDaemonConfig } from '../features/heritage/daemon.js';
import fs from 'fs/promises';

const app = express();
const PORT = process.env.EMBED_UI_PORT ? Number(process.env.EMBED_UI_PORT) : 4000;
const MEMORY_DIR = process.env.MEMORY_DIR || path.join('/tmp', 'mcp-creative-memory');
const DEFAULT_MODEL = process.env.DEFAULT_EMBEDDING_MODEL || 'qwen3-embedding:latest';

// Serve static UI from dist/web/static if present, else from src/web/static for dev
const staticPathDist = path.join(process.cwd(), 'dist', 'web', 'static');
const staticPathSrc = path.join(process.cwd(), 'src', 'web', 'static');
const staticPath = (async () => {
  try {
    await fs.access(staticPathDist);
    return staticPathDist;
  } catch {
    return staticPathSrc;
  }
})();

(async () => {
  const p = await staticPath;
  app.use(express.static(p));

  // root route: serve index.html explicitly so GET / works in both dev and built modes
  app.get('/', async (req: import('express').Request, res: import('express').Response) => {
    res.sendFile(path.join(p, 'index.html'));
  });
})();

// Endpoint: list artifacts with embeddings (for a given model)
app.get('/api/points', async (req: import('express').Request, res: import('express').Response) => {
  const model = (req.query.model as string) || DEFAULT_MODEL;
  const topK = Number(req.query.top_k || 1000);

  const artifacts = await listArtifacts(MEMORY_DIR);

  // If models query param provided, return overlayed points for each specified model.
  const modelsParam = (req.query.models as string | undefined) || undefined;
  const modelsList = modelsParam ? modelsParam.split(',').map((s) => s.trim()).filter(Boolean) : undefined;

  const points: { id: string; x: number; y: number; text: string; tags: string[]; model?: string }[] = [];

  if (modelsList && modelsList.length > 0) {
    for (const m of modelsList) {
      const ptsForModel: any[] = [];
      for (const a of artifacts) {
        let emb: number[] | undefined = undefined;
        if (a.metadata?.embeddings && a.metadata.embeddings[m]) emb = a.metadata.embeddings[m];
        else if (a.metadata?.embedding) emb = a.metadata.embedding;
        else if (a.metadata?.embeddings) {
          const k = Object.keys(a.metadata.embeddings)[0];
          emb = a.metadata.embeddings[k];
        }
        if (emb) ptsForModel.push({ id: a.id, model: m, emb, text: a.content.map((c) => c.data).join(' | '), tags: a.tags });
      }
      const dims = ptsForModel.map((p) => p.emb as number[]);
      const proj = projectTo2D(dims, `projection-seed-${m}`);
      for (let i = 0; i < ptsForModel.length; i++) {
        points.push({ id: ptsForModel[i].id, x: proj[i][0], y: proj[i][1], text: ptsForModel[i].text, tags: ptsForModel[i].tags, model: m });
      }
    }
  } else {
    // default single-model behavior
    const rawPoints: any[] = [];
    for (const a of artifacts) {
      let emb: number[] | undefined = undefined;
      if (a.metadata?.embeddings && a.metadata.embeddings[model]) emb = a.metadata.embeddings[model];
      else if (a.metadata?.embedding) emb = a.metadata.embedding;
      else if (a.metadata?.embeddings) {
        const k = Object.keys(a.metadata.embeddings)[0];
        emb = a.metadata.embeddings[k];
      }
      if (emb) rawPoints.push({ id: a.id, model: a.model, emb, text: a.content.map((c) => c.data).join(' | '), tags: a.tags });
    }
    const dims = rawPoints.map((p) => p.emb as number[]);
    const proj = projectTo2D(dims, 'projection-seed');
    const out = rawPoints.slice(0, topK).map((p: any, i: number) => ({ id: p.id, x: proj[i][0], y: proj[i][1], text: p.text, tags: p.tags }));
    res.json({ points: out });
    return;
  }

  res.json({ points });
});

// Re-index endpoint (useful to trigger processing of staged items externally)
app.post('/api/reindex', async (req: import('express').Request, res: import('express').Response) => {
  const model = req.query.model as string | undefined;
  try {
    const updated = await indexArtifacts(MEMORY_DIR, model || DEFAULT_MODEL);
    res.json({ ok: true, updated });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.post('/api/process-staging', async (req: import('express').Request, res: import('express').Response) => {
  const model = req.query.model as string | undefined;
  const qforce = req.query.force;
  const force = String(qforce) === 'true' || String(qforce) === '1';
  try {
    const processed = await processStagedEmbeddings(MEMORY_DIR, { force_fallback: force, model });
    res.json({ ok: true, processed });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.post('/api/sleep/start', async (req: import('express').Request, res: import('express').Response) => {
  const intervalMs = Number(req.query.interval_ms || 60000);
  const model = req.query.model as string | undefined;
  const force = String(req.query.force) === 'true' || String(req.query.force) === '1';
  const cfg = startSleepDaemon(MEMORY_DIR, { intervalMs, model, forceFallback: force });
  res.json({ ok: true, cfg });
});

app.post('/api/sleep/stop', async (req: import('express').Request, res: import('express').Response) => {
  stopSleepDaemon();
  res.json({ ok: true });
});

app.get('/api/sleep/status', async (req: import('express').Request, res: import('express').Response) => {
  res.json({ ok: true, running: isSleepDaemonRunning(), config: getSleepDaemonConfig() });
});

function seededRandom(seed: string) {
  let state = 0;
  for (let i = 0; i < seed.length; i++) state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function projectTo2D(vecs: number[][], seed = 'seed') {
  const dim = vecs[0]?.length || 64;
  const rand = seededRandom(seed);
  // make two random projection vectors
  const r1 = new Array(dim).fill(0).map(() => rand() * 2 - 1);
  const r2 = new Array(dim).fill(0).map(() => rand() * 2 - 1);

  // normalize projection vectors
  const norm = (v: number[]) => {
    const s = Math.sqrt(v.reduce((a, b) => a + b * b, 0));
    return v.map((x) => (s === 0 ? 0 : x / s));
  };

  const nr1 = norm(r1);
  const nr2 = norm(r2);

  const out = vecs.map((v) => {
    const x = v.reduce((a, b, i) => a + b * nr1[i], 0);
    const y = v.reduce((a, b, i) => a + b * nr2[i], 0);
    return [x, y];
  });

  // normalize to -1..1
  const xs = out.map((o) => o[0]);
  const ys = out.map((o) => o[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return out.map(([x, y]) => [((x - minX) / (maxX - minX || 1)) * 2 - 1, ((y - minY) / (maxY - minY || 1)) * 2 - 1]);
}

app.listen(PORT, () => console.error(`Embedding UI server running on http://localhost:${PORT}`));

export { projectTo2D };
