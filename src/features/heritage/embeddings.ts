import axios from 'axios';
import { Artifact } from './types';
import fs from 'fs/promises';
import path from 'path';
import { addStagingEntry } from './staging.js';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

export async function tryOllamaEmbedding(model: string, text: string): Promise<number[] | null> {
  try {
    const resp = await axios.post(
      `${OLLAMA_BASE_URL}/api/embeddings`,
      { model, input: text },
      { timeout: 20_000 }
    );

    const emb = resp.data?.data?.[0]?.embedding || resp.data?.embedding || null;
    if (Array.isArray(emb)) return emb.map((n: any) => Number(n));
    return null;
  } catch (err) {
    return null;
  }
}

function hashToVector(text: string, dim = 64): number[] {
  // Deterministic pseudo-random generator from text
  let seed = 0;
  for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
  const vec: number[] = new Array(dim).fill(0);
  for (let i = 0; i < dim; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    // map to [-1, 1]
    vec[i] = ((seed % 10000) / 5000) - 1;
  }
  return vec;
}

export async function embedText(model: string | undefined, text: string, dim = 64): Promise<number[]> {
  if (model) {
    const emb = await tryOllamaEmbedding(model, text);
    if (emb && emb.length > 0) return emb;
  }
  return hashToVector(text, dim);
}

export function cosine(a: number[], b: number[]) {
  let da = 0,
    db = 0,
    num = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    num += a[i] * b[i];
    da += a[i] * a[i];
    db += b[i] * b[i];
  }
  if (da === 0 || db === 0) return 0;
  return num / (Math.sqrt(da) * Math.sqrt(db));
}

export async function indexArtifacts(baseDir: string, model?: string | string[]) {
  // helper: if a single string model is provided, wrap; if array, pass through
  const heritageDir = path.join(baseDir, 'heritage');
  await fs.mkdir(heritageDir, { recursive: true });
  const files = await fs.readdir(heritageDir);
  const updated: string[] = [];

  const models = Array.isArray(model) ? model : model ? [model] : [];

  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    const full = path.join(heritageDir, f);
    const raw = await fs.readFile(full, 'utf-8');
    const art: Artifact = JSON.parse(raw);

    // derive `text` to embed
    const text = (art.content || []).map((c) => c.data).join('\n');
    if (!art.metadata) art.metadata = {};

    if (!art.metadata.embeddings) art.metadata.embeddings = {};

    // If no specific models requested and no embedding exists, compute fallback
    if (models.length === 0) {
      if (!art.metadata.embedding) {
        const emb = await embedText(undefined, text);
        art.metadata.embedding = emb;
        art.metadata.embeddingModel = 'fallback-hash';
        updated.push(art.id);
      }
    } else {
      for (const m of models) {
        try {
          // Attempt model embedding; if Ollama is available this should return a model embedding,
          // otherwise embedText falls back to a deterministic hash embedding to preserve shape.
          const emb = await embedText(m, text);
          // store per-model embedding (will be fallback hash if model unavailable)
          art.metadata.embeddings[m] = emb;
        } catch (err) {
          // on exception, stage the embedding request (rare)
          await addStagingEntry(baseDir, art.id, m);
        }
      }
      art.metadata.embeddingModels = Object.keys(art.metadata.embeddings || {});
      updated.push(art.id);
    }

    await fs.writeFile(full, JSON.stringify(art, null, 2), 'utf-8');
  }

  return updated;
}

export async function semanticSearch(baseDir: string, query: string, topK = 5, model?: string, models?: string[], weights?: Record<string, number>) {
  // If an explicit ensemble `models` list is provided, compute per-model scores and aggregate using z-score normalization and optional weights.
  if (Array.isArray(models) && models.length > 0) {
    const perModelResults: { [model: string]: { artifact: Artifact; score: number }[] } = {};
    for (const m of models) {
      const res = await semanticSearch(baseDir, query, topK * 3, m); // gather wider set per model
      perModelResults[m] = res;
    }

    // collect scores per artifact per model
    const scoresByModel: Record<string, number[]> = {};
    const allArtifactsMap: Record<string, Artifact> = {};
    for (const m of Object.keys(perModelResults)) {
      scoresByModel[m] = [];
      for (const r of perModelResults[m]) {
        allArtifactsMap[r.artifact.id] = r.artifact;
        scoresByModel[m].push(r.score);
      }
    }

    // compute z-score normalization per model
    const zScoresByModel: Record<string, Record<string, number>> = {};
    for (const m of Object.keys(perModelResults)) {
      const arr = perModelResults[m].map((r) => r.score);
      const mean = arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
      const sd = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / (arr.length || 1)) || 1;
      zScoresByModel[m] = {};
      for (const r of perModelResults[m]) {
        zScoresByModel[m][r.artifact.id] = (r.score - mean) / sd;
      }
    }

    // aggregate: for every artifact seen anywhere, average z-scores (weighted)
    const agg: Record<string, { artifact: Artifact; scores: number[] }> = {};
    for (const m of Object.keys(perModelResults)) {
      const weight = (weights && weights[m]) || 1;
      for (const r of perModelResults[m]) {
        if (!agg[r.artifact.id]) agg[r.artifact.id] = { artifact: r.artifact, scores: [] };
        agg[r.artifact.id].scores.push((zScoresByModel[m][r.artifact.id] || 0) * weight);
      }
    }

    const final = Object.values(agg)
      .map((v) => ({ artifact: v.artifact, score: v.scores.reduce((a, b) => a + b, 0) / v.scores.length }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return final;
  }

  // default (single-model or fallback) behavior
  const qemb = await embedText(model, query);
  const heritageDir = path.join(baseDir, 'heritage');
  try {
    const files = await fs.readdir(heritageDir);
    const results: { artifact: Artifact; score: number }[] = [];
    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      const raw = await fs.readFile(path.join(heritageDir, f), 'utf-8');
      const art: Artifact = JSON.parse(raw);

      // Prefer embeddings for the requested model, else any model embedding, else fallback hash
      let aemb: number[] | undefined = undefined;
      if (model && art.metadata?.embeddings && art.metadata.embeddings[model]) {
        aemb = art.metadata.embeddings[model];
      } else if (art.metadata?.embedding) {
        aemb = art.metadata.embedding;
      } else if (art.metadata?.embeddings) {
        const keys = Object.keys(art.metadata.embeddings);
        if (keys.length > 0) aemb = art.metadata.embeddings[keys[0]];
      }

      if (!aemb) aemb = hashToVector((art.content || []).map((c) => c.data).join('\n'));

      const score = cosine(qemb, aemb);
      results.push({ artifact: art, score });
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  } catch (err) {
    return [];
  }
}
