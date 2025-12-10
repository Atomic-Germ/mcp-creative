import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import axios from "axios";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { execSync } from "node:child_process";

const BUILD_CMD = "npm run build";

vi.mock("axios");

describe("creative_ponder with Ollama (mocked)", () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    execSync(BUILD_CMD, { stdio: "inherit" });

    transport = new StdioClientTransport({
      command: "node",
      args: ["dist/index.js"],
    });

    client = new Client({
      name: "creative-meditation-ollama-test-client",
      version: "1.0.0",
    });

    await client.connect(transport);
  });

  afterAll(async () => {
    await client.close();
    await transport.close();
  });

  it("falls back gracefully and can embrace failure when consult fails", async () => {
    const mockedAxios = axios as unknown as {
      get: ReturnType<typeof vi.fn>;
      post: ReturnType<typeof vi.fn>;
    };

    mockedAxios.get.mockResolvedValue({ status: 200, data: { models: [] } });
    mockedAxios.post.mockRejectedValue(new Error("Simulated Ollama failure"));

    const meditationResult = await client.callTool({
      name: "creative_meditate",
      arguments: { context_words: ["ollama", "failure"], num_random_words: 4 },
    });

    const medText = (meditationResult.content as any)[0].text as string;
    expect(medText).toContain("CREATIVE MEDITATION");

    const insightResult = await client.callTool({
      name: "creative_insight",
      arguments: {},
    });

    const insightText = (insightResult.content as any)[0].text as string;
    expect(insightText).toContain("CREATIVE INSIGHTS");

    const ponderDefault = await client.callTool({
      name: "creative_ponder",
      arguments: {
        consult_model: "dummy-model",
      },
    });

    const ponderDefaultText = (ponderDefault.content as any)[0].text as string;
    expect(ponderDefaultText).toContain("CREATIVE PONDERING");
    expect(ponderDefaultText).toContain("While attempting to consult external wisdom, the connection faltered.");

    const ponderEmbrace = await client.callTool({
      name: "creative_ponder",
      arguments: {
        consult_model: "dummy-model",
        mode: "embrace-failure",
      },
    });

    const ponderEmbraceText = (ponderEmbrace.content as any)[0].text as string;
    expect(ponderEmbraceText).toContain("CREATIVE PONDERING");
    expect(ponderEmbraceText).toContain("Consultation frayed and would not fully arrive");
  }, 60_000);
});
