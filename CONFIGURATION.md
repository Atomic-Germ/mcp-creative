# MCP Creative Configuration Examples

## Claude Desktop Configuration

Add this to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "creative": {
      "command": "node",
      "args": [
        "/home/casey/.local/mcp/mcp-creative/dist/index.js"
      ],
      "env": {
        "OLLAMA_BASE_URL": "http://localhost:11434",
        "MEMORY_DIR": "/tmp/mcp-creative-memory"
      }
    }
  }
}
```

## With Both Creative and Consult Servers

```json
{
  "mcpServers": {
    "creative": {
      "command": "node",
      "args": [
        "/home/casey/.local/mcp/mcp-creative/dist/index.js"
      ],
      "env": {
        "OLLAMA_BASE_URL": "http://localhost:11434",
        "MEMORY_DIR": "/tmp/mcp-creative-memory"
      }
    },
    "consult": {
      "command": "node",
      "args": [
        "/home/casey/.local/mcp/mcp-consult/dist/index.js"
      ],
      "env": {
        "OLLAMA_BASE_URL": "http://localhost:11434"
      }
    }
  }
}
```

## Example Usage Flow

Once configured, you can use the tools naturally in conversation:

1. **Start a meditation:**
   ```
   Let's do a creative meditation about "quantum" and "consciousness"
   ```

2. **Extract insights:**
   ```
   What insights emerged from that meditation?
   ```

3. **Ponder deeply:**
   ```
   Let's ponder these insights using the llama2 model
   ```

## Environment Variables

- `OLLAMA_BASE_URL` - URL for Ollama API (default: http://localhost:11434)
- `MEMORY_DIR` - Directory for storing meditation states (default: /tmp/mcp-creative-memory)

## Testing the Installation

Run the demo client to verify everything is working:

```bash
cd /home/casey/.local/mcp/mcp-creative
npm run demo
```
