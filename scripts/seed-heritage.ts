import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  const models = [
    'AnInterestingSurname/gemmasutra-mini-2b-v1:q8_0',
    'driaforall/tiny-agent-a:1.5b',
    'tinyllama:1.1b-chat-v1-fp16',
    'sam860/granite-4.0:1b',
    'prometech_corp/prettybird_bce_basic:latest',
  ];

  const transport = new StdioClientTransport({ command: 'node', args: ['dist/index.js'], env: { ...process.env, MEMORY_DIR: '/tmp/mcp-creative-memory' } });
  const client = new Client({ name: 'heritage-seeder', version: '1.0.0' });
  await client.connect(transport);

  for (const m of models) {
    try {
      console.log(`Seeding from model: ${m}`);
      const res = await client.callTool({ name: 'heritage_seed', arguments: { model: m, prompt: 'Create a 2-3 sentence sensory vignette suitable as a model conditioning artifact; end with a line starting with TAGS: followed by comma-separated tags.' } });
      console.log((res.content as any)[0].text);
    } catch (err) {
      console.error(`Failed for model ${m}:`, err);
    }
  }

  const list = await client.callTool({ name: 'heritage_list', arguments: {} });
  console.log('\nFinal heritage list:');
  console.log((list.content as any)[0].text);

  await client.close();
  await transport.close();
}

main().catch(console.error);
