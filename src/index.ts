import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { listTools, callToolHandler } from "./handlers.js";

const server = new Server({
  name: "creative-meditate",
  version: "1.0.0",
});

server.setRequestHandler(ListToolsRequestSchema, async () => listTools());

server.setRequestHandler(CallToolRequestSchema, async (request) => callToolHandler(request.params));

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Creative Meditation MCP server running on stdio");
}

main().catch(console.error);
