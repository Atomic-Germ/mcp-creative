import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function runDemo() {
  console.log('🧘 Starting Creative Meditation Demo\n');

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js'],
  });

  const client = new Client({
    name: 'creative-demo-client',
    version: '1.0.0',
  });

  await client.connect(transport);

  try {
    // List available tools
    console.log('📋 Available tools:');
    const tools = await client.listTools();
    tools.tools.forEach((tool: any) => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    console.log();

    // Step 1: Meditate
    console.log('🧘 Step 1: Creative Meditation');
    console.log("Meditating with context words: ['consciousness', 'emergence', 'pattern']...\n");

    const meditationResult = await client.callTool({
      name: 'creative_meditate',
      arguments: {
        context_words: ['consciousness', 'emergence', 'pattern'],
        num_random_words: 10,
      },
    });

    console.log((meditationResult.content as any)[0].text);
    console.log('\n' + '='.repeat(80) + '\n');

    // Step 2: Extract insights
    console.log('🔍 Step 2: Extracting Insights');
    console.log('Analyzing the meditation for meaningful patterns...\n');

    const insightResult = await client.callTool({
      name: 'creative_insight',
      arguments: {},
    });

    console.log((insightResult.content as any)[0].text);
    console.log('\n' + '='.repeat(80) + '\n');

    // Step 3: Ponder (will use internal reflection if Ollama not available)
    console.log('🤔 Step 3: Deep Pondering');
    console.log('Contemplating the insights...\n');

    const ponderResult = await client.callTool({
      name: 'creative_ponder',
      arguments: {
        // consult_model: "llama2"  // Uncomment if you have Ollama running
      },
    });

    console.log((ponderResult.content as any)[0].text);
    console.log('\n' + '='.repeat(80) + '\n');

    console.log('✨ Demo complete! Check /tmp/mcp-creative-memory for saved states.');
  } catch (error) {
    console.error('Error during demo:', error);
  } finally {
    await client.close();
  }
}

runDemo().catch(console.error);
