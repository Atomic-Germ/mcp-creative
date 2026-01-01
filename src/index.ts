#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { listTools, callToolHandler } from './handlers.js';
import { startSleepDaemon } from './features/heritage/daemon.js';

const server = new Server({
  name: 'creative-meditate',
  version: '1.0.0',
});

server.setRequestHandler(ListToolsRequestSchema, async () => listTools());

server.setRequestHandler(CallToolRequestSchema, async (request) => callToolHandler(request.params));

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Creative Meditation MCP server running on stdio');

  // Optionally auto-start the sleep daemon on boot
  const startSleepOnBoot = (process.env.START_SLEEP_ON_BOOT || '').toLowerCase() === 'true';
  const intervalMs = Number(process.env.SLEEP_INTERVAL_MS || 60000);
  const model = process.env.DEFAULT_EMBEDDING_MODEL || undefined;
  const force = (process.env.SLEEP_FORCE_FALLBACK || '').toLowerCase() === 'true';

  if (startSleepOnBoot) {
    console.error(`Starting sleep daemon on boot: intervalMs=${intervalMs}, model=${model || 'none'}, force=${force}`);
    startSleepDaemon(process.env.MEMORY_DIR || '/tmp/mcp-creative-memory', { intervalMs, model, forceFallback: force });
  }
}

main().catch(console.error);