import axios from 'axios';

import { Artifact } from './types';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

function fallbackVignette(seed?: string) {
  const fragments = [
    'a glass city',
    'echoing corridors',
    'a whispered algorithm',
    'salt and static',
    'a paper tide',
    'luminous moss',
    'clockwork clouds',
  ];
  const pick = (n = 1) =>
    new Array(n)
      .fill(0)
      .map(() => fragments[Math.floor(Math.random() * fragments.length)])
      .join(', ');
  return `VIGNETTE (${seed || 'ad-hoc'}): ${pick(2)}; ${pick(1)}; ${pick(1)}.`;
}

export async function generateArtifactFromModel(opts: {
  model?: string;
  prompt?: string;
  systemPrompt?: string;
}): Promise<Artifact> {
  const { model, prompt, systemPrompt } = opts;
  const id = `artifact-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
  let contentText = '';

  if (model && prompt) {
    try {
      const response = await axios.post(
        `${OLLAMA_BASE_URL}/api/generate`,
        {
          model,
          prompt,
          system: systemPrompt,
          stream: false,
        },
        { timeout: 20000 }
      );

      // Ollama returns .response in our environment
      contentText =
        typeof response.data?.response === 'string'
          ? response.data.response
          : String(response.data);
    } catch (error) {
      // fall back
      contentText = fallbackVignette(typeof prompt === 'string' ? prompt : undefined);
    }
  } else {
    contentText = fallbackVignette(prompt);
  }

  const artifact: Artifact = {
    id,
    model,
    prompt,
    systemPrompt,
    content: [
      {
        type: 'text',
        data: contentText,
      },
    ],
    tags: ['seed', 'model-generated'],
    metadata: { seeded: true },
    createdAt: new Date().toISOString(),
  };

  return artifact;
}
