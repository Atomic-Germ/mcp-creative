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

    // check staging behavior: ask to index with a clearly-nonexistent model and verify staging
    const idxRes = await client.callTool({ name: 'heritage_index', arguments: { model: ['this-model-does-not-exist-xyz'] } });
    const idxText = (idxRes.content as any)[0].text as string;
    expect(idxText).toContain('Indexed');

    const stageList = await client.callTool({ name: 'heritage_staging_list', arguments: {} });
    const stageText = (stageList.content as any)[0].text as string;
    expect(stageText).toContain('Staged');

    // process staging entries, forcing fallback embedding so these staged entries get embedded now
    const proc = await client.callTool({ name: 'heritage_process_staging', arguments: { force_fallback: true } });
    const procText = (proc.content as any)[0].text as string;
    expect(procText).toContain('Processed staging entries');

    // staged entries should be cleared
    const stageListAfter = await client.callTool({ name: 'heritage_staging_list', arguments: {} });
    const stageTextAfter = (stageListAfter.content as any)[0].text as string;
    // staged list should now show zero
    expect(stageTextAfter).toContain('Staged (0');

    // Now verify daemon: start it with a short interval (100ms), create another staged artifact, and ensure daemon clears it.
    const startRes = await client.callTool({ name: 'heritage_start_sleep', arguments: { interval_ms: 100, force_fallback: true } });
    expect((startRes.content as any)[0].text).toContain('Sleep daemon started');

    // create another manual artifact to stage
    const manual2 = {
      id: 'manual-ocean-2',
      model: 'manual',
      prompt: 'manual',
      content: [{ type: 'text', data: 'oceanic residue of sleep' }],
      tags: ['ocean', 'manual'],
      metadata: {},
      createdAt: new Date().toISOString(),
    };
    await (await import('node:fs/promises')).writeFile(join(MEMORY_DIR, 'heritage', `${manual2.id}.json`), JSON.stringify(manual2, null, 2), 'utf-8');

    // index with a fake model to force staging
    await client.callTool({ name: 'heritage_index', arguments: { model: ['this-model-does-not-exist-xyz'] } });

    // wait a short while for the daemon to run (it runs every 100ms)
    await new Promise((r) => setTimeout(r, 350));

    // staged entries should be cleared now (daemon should have processed)
    const stageListAfterDaemon = await client.callTool({ name: 'heritage_staging_list', arguments: {} });
    const stageTextAfterDaemon = (stageListAfterDaemon.content as any)[0].text as string;
    expect(stageTextAfterDaemon).toContain('Staged (0');

    // stop daemon
    const stopRes = await client.callTool({ name: 'heritage_stop_sleep', arguments: {} });
    expect((stopRes.content as any)[0].text).toContain('Sleep daemon stopped');

    // Test record-day API: create a low-res transcript and make sure it's saved and staged
    const recordRes = await client.callTool({ name: 'heritage_record_day', arguments: { transcript: 'Woke at dawn. Saw the ocean. Coffee. Strange signal in the attic.' } });
    const recordText = (recordRes.content as any)[0].text as string;
    expect(recordText).toContain('Recorded day artifact saved: id=');

    const stageAfterRecord = await client.callTool({ name: 'heritage_staging_list', arguments: {} });
    const stageAfterRecordText = (stageAfterRecord.content as any)[0].text as string;
    expect(stageAfterRecordText).toContain('Staged');

    // process the staged entries via the daemon-stop/start to clean up
    await client.callTool({ name: 'heritage_process_staging', arguments: { force_fallback: true } });
    const stageAfterProcess = await client.callTool({ name: 'heritage_staging_list', arguments: {} });
    const stageAfterProcessText = (stageAfterProcess.content as any)[0].text as string;
    expect(stageAfterProcessText).toContain('Staged (0');
  }, 60_000);

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
