import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MEMORY_DIR = process.env.MEMORY_DIR || path.join('/tmp', 'mcp-creative-memory');

axios.defaults.timeout = axios.defaults.timeout || 60_000;

interface MeditationState {
  randomWords: string[];
  contextWords: string[];
  emergentSentence?: string;
  interpretation?: string;
  timestamp: string;
}

interface InsightState {
  insights: string[];
  timestamp: string;
}

let lastMeditation: MeditationState | null = null;
let lastInsight: InsightState | null = null;

// Word corpus for random generation
// Organized into loose thematic pools to encourage strange collisions.
const ABSTRACT_CORE = [
  'quantum',
  'flux',
  'essence',
  'void',
  'nexus',
  'spiral',
  'echo',
  'shimmer',
  'threshold',
  'portal',
  'weave',
  'fractal',
  'resonance',
  'entropy',
  'harmony',
  'paradox',
  'catalyst',
  'metamorphosis',
  'synthesis',
  'emergence',
  'confluence',
  'infinity',
  'luminescence',
  'oscillation',
  'crystalline',
  'ephemeral',
  'eternal',
  'membrane',
  'substrate',
  'lattice',
  'matrix',
  'dimension',
  'singularity',
  'cascade',
  'ripple',
  'vortex',
  'prism',
  'spectrum',
  'wavelength',
  'frequency',
  'amplitude',
  'phase',
  'coherence',
  'interference',
  'superposition',
  'entanglement',
  'transcendence',
  'immanence',
  'radiance',
  'shadow',
  'reflection',
  'refraction',
];

const MUNDANE_OBJECTS = [
  'spoon',
  'doorknob',
  'elevator',
  'receipt',
  'coffee',
  'pillow',
  'staircase',
  'notebook',
  'window',
  'backpack',
  'umbrella',
  'remote',
  'toothbrush',
  'headphones',
  'coin',
  'ticket',
  'keyboard',
  'mirror',
  'towel',
  'lamp',
  'chair',
  'socket',
  'cable',
  'battery',
  'cup',
  'plate',
  'bus',
  'train',
  'pavement',
  'thumbnail',
];

const GLITCH_TECH = [
  'packet',
  'latency',
  'buffer',
  'segfault',
  'kernel',
  'cursor',
  'firmware',
  'console',
  'cache',
  'syntax',
  'runtime',
  'daemon',
  'socket',
  'protocol',
  'hash',
  'opcode',
  'allocator',
  'heap',
  'pointer',
  'overflow',
  'underflow',
  'checksum',
  'iterator',
  'sandbox',
  'container',
  'pipeline',
  'nanosecond',
];

const BIZARRE_ACTIONS = [
  'melts',
  'oscillates',
  'bleeds',
  'flickers',
  'loops',
  'spills',
  'dissolves',
  'folds',
  'reboots',
  'mutates',
  'echoes',
  'sprawls',
  'glitches',
  'stutters',
  'sprawls',
  'drifts',
  'erases',
  'splices',
  'reverses',
  'decompresses',
  'encrypts',
  'scrambles',
  'shears',
  'fractures',
  'remixes',
];

const EMOTIONS = [
  'longing',
  'quiet-joy',
  'melancholy',
  'irritation',
  'awe',
  'tension',
  'relief',
  'nostalgia',
  'anticipation',
  'dread',
  'gratitude',
  'tenderness',
  'restlessness',
  'confusion',
  'clarity',
  'euphoria',
  'weariness',
  'curiosity',
];

const PLACE_FRAGMENTS = [
  'corridor',
  'rooftop',
  'subway',
  'waiting-room',
  'server-room',
  'attic',
  'crosswalk',
  'forest-edge',
  'parking-lot',
  'kitchen-sink',
  'airport-gate',
  'empty-theatre',
  'hotel-lobby',
  'data-center',
  'hinterland',
  'harbor',
];

const NUMBER_STRINGS = [
  '4183',
  '0000',
  '13',
  '1010',
  '404',
  '3.1415',
  '0xDEAD',
  '2049',
  '∞',
  '11:11',
  '7e3',
  '001101',
  '5/8',
  '9.81',
];

const SYMBOL_NOISE = [
  '#?',
  '∴',
  '≈',
  '/dev/null',
  '::*',
  '//TODO',
  '#!',
  '{ }',
  '<>',
  '⁂',
  '^Z',
  'ctrl-c',
  '%TEMP%',
  '~/',
  'ψ',
  '∆',
  '★',
  '☍',
];

const RANDOM_POOLS: string[][] = [
  ABSTRACT_CORE,
  MUNDANE_OBJECTS,
  GLITCH_TECH,
  BIZARRE_ACTIONS,
  EMOTIONS,
  PLACE_FRAGMENTS,
  NUMBER_STRINGS,
  SYMBOL_NOISE,
];

function generateRandomWords(count: number, randomFn: () => number = Math.random): string[] {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    const pool = RANDOM_POOLS[Math.floor(randomFn() * RANDOM_POOLS.length)];
    words.push(pool[Math.floor(randomFn() * pool.length)]);
  }
  return words;
}

function createSeededRandom(seed: string): () => number {
  let state = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  if (state === 0) state = 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 0x100000000;
    return state / 0x100000000;
  };
}

function generatePseudoRandomSeed(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

function attemptSentenceFormation(randomWords: string[], contextWords: string[]): string | null {
  const allWords = [...randomWords, ...contextWords];
  if (allWords.length === 0) return null;

  const pick = (): string => allWords[Math.floor(Math.random() * allWords.length)];

  const sentenceTemplates = [
    () => `Between ${pick()} and ${pick()}, ${pick()} ${pick()} around ${pick()}.`,
    () => `${pick()} drifts through ${pick()}, annotated by ${pick()} and forgotten ${pick()}.`,
    () => `In the corridor between ${pick()} and ${pick()}, ${pick()} quietly ${pick()}.`,
    () => `${pick()} remembers ${pick()} while ${pick()} glitches beside ${pick()}.`,
    () => `${pick()} is a note scribbled in the margin of ${pick()} ${pick()}.`,
  ];

  // 50% of the time, use a structured but surreal template.
  if (allWords.length >= 4 && Math.random() < 0.5) {
    const template = sentenceTemplates[Math.floor(Math.random() * sentenceTemplates.length)];
    return template();
  }

  // Fallback: shuffled fragment chain.
  const shuffled = [...allWords].sort(() => Math.random() - 0.5);
  if (shuffled.length >= 3) {
    const maxWords = Math.min(14, shuffled.length);
    const sentence =
      shuffled
        .slice(0, maxWords)
        .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
        .join(' ') + '.';
    return sentence;
  }

  return null;
}

export function listTools() {
  return {
    tools: [
      {
        name: 'creative_meditate',
        description:
          'Generates random/pseudorandom words mapped loosely with selected context words until a syntactically meaningful sentence emerges, then interprets it. The model receives streams of conceptual fragments that coalesce into emergent meaning.',
        inputSchema: {
          type: 'object',
          properties: {
            context_words: {
              type: 'array',
              items: { type: 'string' },
              description: 'Selected words or phrases from context to include in the meditation',
            },
            num_random_words: {
              type: 'number',
              description: 'Number of random words to generate (default: 12)',
              default: 12,
            },
            seed: {
              type: 'string',
              description: 'Optional seed for pseudorandom generation',
            },
          },
          required: [],
        },
      },
      {
        name: 'creative_insight',
        description:
          'Examines the previous meditation result and extracts meaningful insights, patterns, or interpretations. Returns insights if found, or indicates none were discovered.',
        inputSchema: {
          type: 'object',
          properties: {
            meditation_id: {
              type: 'string',
              description:
                'Optional ID of a specific meditation to analyze (defaults to last meditation)',
            },
          },
          required: [],
        },
      },
      {
        name: 'creative_ponder',
        description:
          "Takes insights from creative_insight and either consults the mcp-consult server (if available) or treats the insights as an 'Ask' type prompt for deeper contemplation. Returns the pondering results.",
        inputSchema: {
          type: 'object',
          properties: {
            insight_text: {
              type: 'string',
              description: 'Optional specific insight text to ponder (defaults to last insight)',
            },
            consult_model: {
              type: 'string',
              description: 'Model to use for consultation if mcp-consult is available',
            },
            prefer_consult: {
              type: 'boolean',
              description: 'Whether to prefer using mcp-consult if available (default: true)',
              default: true,
            },
          },
          required: [],
        },
      },
    ],
  };
}

async function checkConsultAvailable(): Promise<boolean> {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 2000 });
    return response.status === 200;
  } catch {
    return false;
  }
}

async function consultOllama(
  model: string,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model,
      prompt,
      system: systemPrompt,
      stream: false,
    });
    return response.data.response;
  } catch (error) {
    throw new Error(`Consult failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function callToolHandler(params: { name: string; arguments?: any }): Promise<any> {
  const name = params.name;
  const args = params.arguments || {};

  switch (name) {
    case 'creative_meditate': {
      const contextWords = (args?.context_words as string[]) || [];
      const numRandomWords = (args?.num_random_words as number) || 12;
      const seed = args?.seed as string | undefined;
      const randomFn = seed ? createSeededRandom(seed) : Math.random;
      const randomWords = generateRandomWords(numRandomWords, randomFn);

      // Attempt to form a meaningful sentence
      let emergentSentence: string | null = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (!emergentSentence && attempts < maxAttempts) {
        emergentSentence = attemptSentenceFormation(randomWords, contextWords);
        if (!emergentSentence) {
          // Add more random words and try again
          randomWords.push(...generateRandomWords(3, randomFn));
          attempts++;
        }
      }

      if (!emergentSentence) {
        emergentSentence = 'The fragments resist coalescence; meaning remains diffuse.';
      }

      // Interpret the emergent sentence
      const sampleRandom = randomWords.slice(0, 7).join(', ');
      const hasDigitsOrSymbols = randomWords.some((w) => /[0-9#%&@/\\_*<>]/.test(w));
      const baseTheme = emergentSentence.toLowerCase().includes('void')
        ? 'emptiness and potential'
        : emergentSentence.toLowerCase().includes('resonance')
          ? 'harmonic connections'
          : 'emergent patterns';

      const noiseComment = hasDigitsOrSymbols
        ? 'The field is saturated with near-pure ciphertext: digits, symbols, and glitches that refuse single meanings.'
        : 'The field leans more toward verbal imagery than raw noise, inviting slower decoding.';

      const keyComment =
        contextWords.length > 0
          ? 'Your supplied context behaves like a partial decryption key, subtly biasing the hallucinated meaning.'
          : 'With no explicit context, the system treats noise itself as both cipher and key, inventing structure on the fly.';

      const interpretation = `From the interplay of random (${sampleRandom}...) and contextual elements (${contextWords.join(', ') || 'none'}), emerges: "${emergentSentence}"\n\nThis synthesis suggests a contemplation on ${baseTheme}. ${noiseComment} ${keyComment} Each pass over the same seed could decode a different story from the same underlying scramble.`;

      lastMeditation = {
        randomWords,
        contextWords,
        emergentSentence,
        interpretation,
        timestamp: new Date().toISOString(),
      };

      // Save meditation state
      await fs.mkdir(MEMORY_DIR, { recursive: true });
      const meditationFile = path.join(MEMORY_DIR, `meditation-${generatePseudoRandomSeed()}.json`);
      await fs.writeFile(meditationFile, JSON.stringify(lastMeditation, null, 2), 'utf-8');

      return {
        content: [
          {
            type: 'text',
            text:
              `🧘 CREATIVE MEDITATION\n\n` +
              `Random Elements: ${randomWords.join(', ')}\n` +
              `Context Elements: ${contextWords.join(', ') || '(none)'}\n\n` +
              `✨ EMERGENT SENTENCE:\n"${emergentSentence}"\n\n` +
              `💭 INTERPRETATION:\n${interpretation}\n\n` +
              `(Meditation state saved to ${meditationFile})`,
          },
        ],
      };
    }

    case 'creative_insight': {
      if (!lastMeditation) {
        return {
          content: [
            {
              type: 'text',
              text: 'No previous meditation found. Please run creative_meditate first.',
            },
          ],
        };
      }

      // Extract insights from the meditation
      const insights: string[] = [];

      if (lastMeditation.emergentSentence) {
        insights.push(`Core emergence: "${lastMeditation.emergentSentence}"`);
      }

      if (lastMeditation.contextWords.length > 0) {
        insights.push(
          `Contextual anchors provided structure: ${lastMeditation.contextWords.join(', ')}`
        );
      }

      if (lastMeditation.randomWords.some((w) => ['void', 'infinity', 'eternal'].includes(w))) {
        insights.push('Meditation touched on themes of boundlessness and transcendence');
      }

      if (
        lastMeditation.randomWords.some((w) => ['harmony', 'resonance', 'coherence'].includes(w))
      ) {
        insights.push('Patterns suggest alignment and synchronization of disparate elements');
      }

      if (lastMeditation.randomWords.some((w) => ['paradox', 'entropy', 'chaos'].includes(w))) {
        insights.push('Tension between order and disorder detected in the meditation');
      }

      if (insights.length === 1) {
        insights.push('The meditation reveals the gap between randomness and meaning-making');
      }

      lastInsight = {
        insights,
        timestamp: new Date().toISOString(),
      };

      // Save insight state
      const insightFile = path.join(MEMORY_DIR, `insight-${generatePseudoRandomSeed()}.json`);
      await fs.writeFile(insightFile, JSON.stringify(lastInsight, null, 2), 'utf-8');

      return {
        content: [
          {
            type: 'text',
            text:
              `🔍 CREATIVE INSIGHTS\n\n` +
              `Extracted from meditation at ${lastMeditation.timestamp}\n\n` +
              insights.map((insight, i) => `${i + 1}. ${insight}`).join('\n') +
              `\n\n(Insights saved to ${insightFile})`,
          },
        ],
      };
    }

    case 'creative_ponder': {
      const insightText = args?.insight_text as string | undefined;
      const consultModel = args?.consult_model as string | undefined;
      const preferConsult = args?.prefer_consult !== false;

      const sourceInsight = insightText || (lastInsight ? lastInsight.insights.join('\n') : null);

      if (!sourceInsight) {
        return {
          content: [
            {
              type: 'text',
              text: 'No insights available to ponder. Please run creative_insight first.',
            },
          ],
        };
      }

      let ponderingResult: string;
      let method: string;

      // Check if consult is available
      const consultAvailable = preferConsult && (await checkConsultAvailable());

      if (consultAvailable && consultModel) {
        try {
          const prompt = `You are pondering the following creative insights that emerged from a meditation process:\n\n${sourceInsight}\n\nReflect deeply on these insights. What deeper meanings, connections, or implications do you perceive? What questions do they raise? What synthesis emerges from contemplating them?`;

          ponderingResult = await consultOllama(
            consultModel,
            prompt,
            'You are a philosophical contemplator, skilled at finding deep meaning in emergent patterns and creative insights.'
          );
          method = `Consulted via Ollama model: ${consultModel}`;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          // Fall back to internal pondering
          ponderingResult = `While attempting to consult external wisdom, the connection faltered. Yet this failure itself is instructive: ${sourceInsight}\n\nIn the silence of failed consultation, we find that the insights speak for themselves. They point toward the intersection of randomness and intention, where meaning crystallizes from chaos.`;
          method = `Internal contemplation (consultation failed: ${message})`;
        }
      } else {
        // Internal "Ask" style pondering
        ponderingResult =
          `Pondering in solitude:\n\n${sourceInsight}\n\n` +
          `These insights form a constellation of meaning. They suggest that:\n\n` +
          `• Emergence is not random but arises from the interplay of chaos and structure\n` +
          `• Meaning-making is an active process, not passive reception\n` +
          `• The boundary between signal and noise is itself a creative space\n` +
          `• What appears as randomness may contain hidden order waiting to be perceived\n\n` +
          `The meditation-insight cycle mirrors consciousness itself: fragments coalescing into coherence, then dissolving back into potential.`;
        method = consultAvailable
          ? 'Internal contemplation (no model specified)'
          : 'Internal contemplation (Ollama unavailable)';
      }

      // Save pondering result
      const ponderFile = path.join(MEMORY_DIR, `ponder-${generatePseudoRandomSeed()}.json`);
      await fs.writeFile(
        ponderFile,
        JSON.stringify(
          { sourceInsight, ponderingResult, method, timestamp: new Date().toISOString() },
          null,
          2
        ),
        'utf-8'
      );

      return {
        content: [
          {
            type: 'text',
            text:
              `🤔 CREATIVE PONDERING\n\n` +
              `Method: ${method}\n\n` +
              `SOURCE INSIGHTS:\n${sourceInsight}\n\n` +
              `PONDERING:\n${ponderingResult}\n\n` +
              `(Pondering saved to ${ponderFile})`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { listTools, callToolHandler };
