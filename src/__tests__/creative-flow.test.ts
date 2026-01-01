import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import { readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const MEMORY_DIR = join(tmpdir(), 'mcp-creative-test-memory');
const BUILD_CMD = 'npm run build';

describe('creative meditation API', () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    execSync(BUILD_CMD, { stdio: 'inherit' });
    await rm(MEMORY_DIR, { recursive: true, force: true });

    transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/index.js'],
      env: { ...process.env, MEMORY_DIR },
    });

    client = new Client({
      name: 'creative-meditation-test-client',
      version: '1.0.0',
    });

    await client.connect(transport);
  });

  afterAll(async () => {
    await client.close();
    await transport.close();
    await rm(MEMORY_DIR, { recursive: true, force: true });
  });

  it('runs the meditation → insight → ponder pipeline', async () => {
    const meditationResult = await client.callTool({
      name: 'creative_meditate',
      arguments: {
        context_words: ['copilot', 'test'],
        num_random_words: 6,
        seed: 'test-seed-001',
      },
    });

    const meditationText = (meditationResult.content as any)[0].text as string;
    expect(meditationText).toContain('EMERGENT SENTENCE');
    expect(meditationText).toContain('INTERPRETATION');

    const insightResult = await client.callTool({
      name: 'creative_insight',
      arguments: {},
    });

    const insightText = (insightResult.content as any)[0].text as string;
    expect(insightText).toContain('CREATIVE INSIGHTS');
    expect(insightText).toMatch(/1\./);

    const ponderResult = await client.callTool({
      name: 'creative_ponder',
      arguments: {
        prefer_consult: false,
      },
    });

    const ponderText = (ponderResult.content as any)[0].text as string;
    expect(ponderText).toContain('CREATIVE PONDERING');
    expect(ponderText).toContain('PONDERING:');

    const savedFiles = await readdir(MEMORY_DIR);
    expect(savedFiles.some((file) => file.startsWith('meditation-'))).toBe(true);
    expect(savedFiles.some((file) => file.startsWith('insight-'))).toBe(true);
    expect(savedFiles.some((file) => file.startsWith('ponder-'))).toBe(true);
  }, 60_000);

  it('seeds heritage artifact (fallback) and lists it', async () => {
    const seedResult = await client.callTool({
      name: 'heritage_seed',
      arguments: {
        prompt: 'A small vignette about an ocean of circuits',
        tags: ['oceanic', 'seed-test'],
      },
    });

    const seedText = (seedResult.content as any)[0].text as string;
    expect(seedText).toContain('Artifact saved: id=');

    const listResult = await client.callTool({ name: 'heritage_list', arguments: {} });
    const listText = (listResult.content as any)[0].text as string;
    expect(listText).toContain('Heritage artifacts');

    // ensure file exists in the heritage directory
    const files = await readdir(MEMORY_DIR);
    const heritageDir = files.find((f) => f === 'heritage');
    expect(heritageDir).toBeDefined();

    // the seed call auto-indexes; read the artifact and confirm embedding exists
    const heritageFiles = await readdir(join(MEMORY_DIR, 'heritage'));
    expect(heritageFiles.length).toBeGreaterThan(0);
    const sample = heritageFiles.find((f) => f.endsWith('.json'))!;
    const raw = await (await import('node:fs/promises')).readFile(join(MEMORY_DIR, 'heritage', sample), 'utf-8');
    const art = JSON.parse(raw as string) as any;
    expect(art.metadata).toBeDefined();
    // legacy single embedding or embeddings map must exist
    expect(art.metadata.embedding || art.metadata.embeddings).toBeDefined();

    // write a manual artifact containing 'ocean' to exercise conditioning
    const manual = {
      id: 'manual-ocean',
      model: 'manual',
      prompt: 'manual',
      content: [{ type: 'text', data: 'ocean of circuits and lenses' }],
      tags: ['ocean', 'manual'],
      metadata: {},
      createdAt: new Date().toISOString(),
    };
    const { writeFile } = await import('node:fs/promises');
    await writeFile(join(MEMORY_DIR, 'heritage', `${manual.id}.json`), JSON.stringify(manual, null, 2), 'utf-8');

    // index and then run conditioned meditation
    await client.callTool({ name: 'heritage_index', arguments: {} });

    const medResult = await client.callTool({
      name: 'creative_meditate',
      arguments: {
        heritage_condition: { text: 'ocean', top_k: 2 },
        num_random_words: 4,
        seed: 'conditioning-seed',
      },
    });

    const medText = (medResult.content as any)[0].text as string;
    expect(medText).toContain('EMERGENT SENTENCE');
    // the context elements should include our manual artifact text
    expect(medText).toContain('ocean');
  });

  it('indexes artifacts (fallback) and runs semantic search', async () => {
    const idx = await client.callTool({ name: 'heritage_index', arguments: {} });
    const idxText = (idx.content as any)[0].text as string;
    expect(idxText).toContain('Indexed');

    const search = await client.callTool({ name: 'heritage_search', arguments: { text: 'ocean', top_k: 3 } });
    const searchText = (search.content as any)[0].text as string;
    expect(searchText).toContain('Search results');
    // There should be at least one result line following the header
    const lines = searchText.split('\n');
    expect(lines.length).toBeGreaterThan(1);
  });
});
