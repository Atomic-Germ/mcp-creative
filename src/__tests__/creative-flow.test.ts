import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import { readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const MEMORY_DIR = join(tmpdir(), "mcp-creative-test-memory");
const BUILD_CMD = "npm run build";

describe("creative meditation API", () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    execSync(BUILD_CMD, { stdio: "inherit" });
    await rm(MEMORY_DIR, { recursive: true, force: true });

    transport = new StdioClientTransport({
      command: "node",
      args: ["dist/index.js"],
      env: { ...process.env, MEMORY_DIR },
    });

    client = new Client({
      name: "creative-meditation-test-client",
      version: "1.0.0",
    });

    await client.connect(transport);
  });

  afterAll(async () => {
    await client.close();
    await transport.close();
    await rm(MEMORY_DIR, { recursive: true, force: true });
  });

  it("runs the meditation → insight → ponder pipeline", async () => {
    const meditationResult = await client.callTool({
      name: "creative_meditate",
      arguments: {
        context_words: ["copilot", "test"],
        num_random_words: 6,
        seed: "test-seed-001",
      },
    });

    const meditationText = (meditationResult.content as any)[0].text as string;
    expect(meditationText).toContain("EMERGENT SENTENCE");
    expect(meditationText).toContain("INTERPRETATION");

    const insightResult = await client.callTool({
      name: "creative_insight",
      arguments: {},
    });

    const insightText = (insightResult.content as any)[0].text as string;
    expect(insightText).toContain("CREATIVE INSIGHTS");
    expect(insightText).toMatch(/1\./);

    const ponderResult = await client.callTool({
      name: "creative_ponder",
      arguments: {
        prefer_consult: false,
      },
    });

    const ponderText = (ponderResult.content as any)[0].text as string;
    expect(ponderText).toContain("CREATIVE PONDERING");
    expect(ponderText).toContain("PONDERING:");

    const savedFiles = await readdir(MEMORY_DIR);
    expect(savedFiles.some((file) => file.startsWith("meditation-"))).toBe(true);
    expect(savedFiles.some((file) => file.startsWith("insight-"))).toBe(true);
    expect(savedFiles.some((file) => file.startsWith("ponder-"))).toBe(true);
  }, 60_000);
});
