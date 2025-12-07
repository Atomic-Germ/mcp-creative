# Quick Start Guide

## Installation

```bash
cd /home/casey/.local/mcp/mcp-creative
npm install
npm run build
```

## Test It

```bash
npm run demo
```

## Add to Claude Desktop

Edit your Claude Desktop config:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "creative": {
      "command": "node",
      "args": ["/home/casey/.local/mcp/mcp-creative/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop.

## Use It

In Claude, simply ask:

> "Let's do a creative meditation about consciousness and emergence"

Claude will automatically use the tools:
1. `creative_meditate` to generate the meditation
2. `creative_insight` to extract patterns
3. `creative_ponder` to contemplate deeply

## With Ollama (Optional)

If you have Ollama running locally:

```bash
# In your config, add the model:
creative_ponder({ consult_model: "llama2" })
```

Or tell Claude:
> "Ponder these insights using the mistral model"

## What It Does

- **Meditate**: Combines random conceptual words with your context words until meaning emerges
- **Insight**: Analyzes patterns in the meditation
- **Ponder**: Deeply contemplates the insights

All states are saved to `/tmp/mcp-creative-memory/` for review.

## Philosophy

This isn't traditional AI - it's a contemplative space where randomness meets intention to birth emergent meaning. Use it for creative exploration, breaking through blocks, or discovering unexpected connections.

## Learn More

- [README.md](./README.md) - Full overview and philosophy
- [API.md](./API.md) - Complete API documentation
- [INTEGRATION.md](./INTEGRATION.md) - Integration patterns
- [CONFIGURATION.md](./CONFIGURATION.md) - Configuration examples
