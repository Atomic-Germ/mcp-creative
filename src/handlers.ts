import axios from "axios";
import fs from "fs/promises";
import path from "path";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const MEMORY_DIR = process.env.MEMORY_DIR || path.join("/tmp", "mcp-creative-memory");

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
const RANDOM_WORDS = [
// Abstract/Technical (original style but expanded)
  "quantum", "flux", "essence", "void", "nexus", "spiral", "echo", "shimmer",
  "threshold", "portal", "weave", "fractal", "resonance", "entropy", "harmony",
  "paradox", "catalyst", "metamorphosis", "synthesis", "emergence", "confluence",
  "infinity", "luminescence", "oscillation", "crystalline", "ephemeral", "eternal",
  "membrane", "substrate", "lattice", "matrix", "dimension", "singularity",
  "cascade", "ripple", "vortex", "prism", "spectrum", "wavelength", "frequency",
  "amplitude", "phase", "coherence", "interference", "superposition", "entanglement",
  "transcendence", "immanence", "radiance", "shadow", "reflection", "refraction",
  "manifold", "tensor", "isomorphism", "cryptography", "algorithm", "heuristic",
  "recursive", "asynchronous", "latency", "bandwidth", "payload", "middleware",
  "differential", "cohomology", "fibration", "functor", "monad", "adjunction",
  "equivariant", "holonomic", "microsupport", "ramification", "filtration", "stratification",
  
  // Mundane Everyday Objects
  "spoon", "sock", "toothbrush", "paperclip", "rubberband", "binder", "stapler",
  "mug", "key", "doormat", "lightbulb", "batteries", "remote", "penny", "envelope",
  "button", "zipper", "cork", "sponge", "tupperware", "coaster", "dustpan", "clothespin",
  "extension cord", "air freshener", "candle", "mousetrap", "lunchbox", "water bottle",
  "umbrella", "shopping cart", "traffic cone", "parking meter", "manhole cover", "gutter",
  
  // Corporate/Bureaucratic
  "synergy", "leverage", "paradigm", "stakeholder", "deliverable", "actionable",
  "bandwidth", "drilldown", "ping", "circle back", "touch base", "move the needle",
  "boil the ocean", "synergize", "optimize", "streamline", "disrupt", "pivot",
  "scalability", "ROI", "KPI", "compliance", "audit", "liability", "fiduciary",
  "escalation", "touchpoint", "mindshare", "value-add", "low-hanging fruit",
  
  // Internet/Digital Culture
  "meme", "viral", "hashtag", "algorithm", "bot", "troll", "stream", "content",
  "influencer", "engagement", "clickbait", "SEO", "cookie", "cache", "404",
  "unplugged", "digital detox", "FOMO", "TL;DR", "DM", "AMA", "NSFW", "IRL",
  "meta", "cringe", "based", "ratio", "main character", "vibe check", "touch grass",

  // Biological/Medical
  "mitochondria", "ribosome", "telomere", "apoptosis", "homeostasis", "neuroplasticity",
  "microbiome", "phagocytosis", "cytokine", "antigen", "pathogen", "antibody",
  "placebo", "side effect", "copay", "deductible", "referral", "waiting room",
  "band-aid", "syringe", "catheter", "biopsy", "anesthesia", "post-op", "vein",
  "toenail", "earwax", "fingernail", "belly button", "armpit", "kneecap",
  
  // Emotional/Psychological
  "ennui", "weltschmerz", "sonder", "monachopsis", "exulansis", "anemoia",
  "occhiolism", "altschmerz", "lachesism", "rubatosis", "kuebiko", "liberosis",
  "anxiety", "dread", "malaise", "apathy", "nostalgia", "bittersweet", "melancholy",
  "overwhelm", "burnout", "imposter syndrome", "cognitive dissonance", "projection",
  "deflection", "passive aggressive", "trauma dump", "toxic positivity", "boundaries",
  
  // Food & Consumables
  "mayonnaise", "ketchup", "relish", "mustard", "pickle", "tater tot", "hot dog",
  "instant noodles", "frozen pizza", "cereal", "milk", "bread", "butter", "eggs",
  "coffee", "energy drink", "protein bar", "gummy vitamins", "leftovers", "condiment",
  "sauce packet", "flavor dust", "cheese dust", "bone broth", "plant-based", "artisanal",
  "craft", "small batch", "single origin", "gluten-free", "keto-friendly", "organic",
  
  // Financial/Economic
  "inflation", "deflation", "stagflation", "recession", "depression", "bull market",
  "bear market", "cryptocurrency", "NFT", "blockchain", "liquidity", "margin call",
  "short squeeze", "diversification", "portfolio", "amortization", "depreciation",
  "tax shelter", "deduction", "withholding", "compound interest", "opportunity cost",
  
  // Legal/Governmental
  "jurisdiction", "precedent", "subpoena", "affidavit", "deposition", "litigation",
  "tort", "negligence", "eminent domain", "bureaucracy", "red tape", "loophole",
  "statute", "ordinance", "permit", "compliance", "regulation", "audit", "waiver",
  "disclaimer", "terms of service", "privacy policy", "NDA", "force majeure",

  // Pop Culture
  "butterfly effect", "red pill", "blue pill", "force", "lightsaber", "TARDIS",
  "sonic screwdriver", "infinity stone", "demogorgon", "upsidedown", "muggle",
  "squib", "horcrux", "parseltongue", "mandalorian", "droid", "wookie", "jedi",
  "sith", "replicant", "blade runner", "tyrell corporation", "weyland-yutani",
  
  // Body Parts & Functions
  "elbow", "kneecap", "earlobe", "nostril", "cuticle", "follicle", "taste bud",
  "uvula", "appendix", "pancreas", "spleen", "gallbladder", "bile duct",
  "hiccup", "sneeze", "cough", "yawn", "snore", "burp", "fart", "blush", "sweat",
  "goosebumps", "hangnail", "callus", "corn", "bunion", "wart", "mole", "freckle",
  
  // Random Verbs
  "transmogrify", "defenestrate", "obfuscate", "concatenate", "discombobulate",
  "flabbergast", "bamboozle", "hornswoggle", "skedaddle", "absquatulate",
  "click", "scroll", "swipe", "tap", "pinch", "zoom", "drag", "drop", "toggle",
  "reboot", "refresh", "clear cache", "force quit", "task kill", "unplug", "reboot",
  "disassemble", "reassemble", "solder", "debug", "compile", "deploy", "rollback",
  "synchronize", "backup", "restore", "encrypt", "decrypt", "authenticate",
  "authorize", "log in", "log out", "sign up", "subscribe", "unsubscribe",
  "streamline", "optimize", "monetize", "gamify", "customize", "personalize",
  
  // Random Adjectives
  "gargantuan", "infinitesimal", "sesquipedalian", "pulchritudinous", "lugubrious",
  "mellifluous", "obsequious", "perspicacious", "quixotic", "sanguine",
  "janky", "busted", "wonky", "funky", "sketchy", "dodgy", "sus", "cringe", "mid",
  "basic", "extra", "slay", "lit", "fire", "dope", "sick", "tight", "gucci", "bougie",
  
  // Geographical/Natural (Mundane)
  "cul-de-sac", "intersection", "overpass", "underpass", "roundabout", "dead end",
  "pothole", "speed bump", "median strip", "drainage ditch", "retention pond", "sewer",
  "landfill", "recycling bin", "compost heap", "parking lot", "strip mall", "subdivision",
  "utility pole", "cell tower", "water tower", "grain silo", "substation", "transformer",
  
  // Household Items
  "vacuum", "dishwasher", "microwave", "blender", "toaster", "coffee maker", "kettle",
  "ironing board", "laundry basket", "hanger", "dryer sheet", "fabric softener",
  "drain cleaner", "plunger", "toilet brush", "shower curtain", "bath mat", "loofah",
  "deodorant", "mouthwash", "floss", "Q-tip", "tissue", "paper towel", "sponge",

  // Transportation
  "hubcap", "windshield wiper", "turn signal", "brake light", "tailpipe", "muffler",
  "transmission", "differential", "serpentine belt", "hubcap", "dashboard", "odometer",
  "fare card", "turnstile", "platform", "conductor", "track maintenance", "signal delay",
  "overhead bin", "tray table", "seatback", "life vest", "floatation device", "tarmac",
  
  // Clothing & Accessories
  "pocket", "buttonhole", "zipper pull", "shoelace", "aglet", "hem", "cuff", "collar",
  "waistband", "underwire", "pantyhose", "tube sock", "crew neck", "turtleneck",
  "fanny pack", "wallet chain", "keychain", "lanyard", "name tag", "iron-on patch",
  "lint roller", "stain remover", "fabric shaver", "hanger", "garment bag", "shoe tree",
  
  // Time/Measurement
  "fortnight", "score", "century", "millennium", "nanosecond", "jiffy", "moment",
  "smidgen", "pinch", "dash", "scooch", "tad", "skosh", "hair's breadth", "stone",
  "fathom", "league", "parsec", "light-year", "astronomical unit", "angstrom", "micron",
  "calorie", "joule", "watt", "horsepower", "foot-pound", "newton-meter", "pascal",
  
  // Additional Dissonance
  "bureaucratic nightmare", "existential dread", "tax season", "root canal", "jury duty",
  " DMV appointment", "printer ink", "software update", "terms and conditions", "privacy policy",
  "cookie consent", "captcha", "two-factor authentication", "forgot password", "buffering",
  "deadline", "performance review", "quarterly earnings", "fiduciary responsibility", "moral hazard",
  "asymmetric information", "adverse selection", "prisoner's dilemma", "tragedy of the commons",
  "slippery slope", "false equivalence", "whataboutism", "circular reasoning", "appeal to authority",
  "post hoc ergo propter hoc", "ad hominem", "straw man", "moving the goalposts", "gaslighting",
  "negging", "love bombing", "trauma bonding", "parasocial relationship", "stan culture",
  "cancel culture", "callout post", "doomscrolling", "chronically online", "terminally online",
  "touch starvation", "sleep debt", "decision fatigue", "analysis paralysis", "imposter syndrome"
];

function generateRandomWords(count: number, randomFn: () => number = Math.random): string[] {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(RANDOM_WORDS[Math.floor(randomFn() * RANDOM_WORDS.length)]);
  }
  return words;
}

function createSeededRandom(seed: string): () => number {
  let state = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
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

// Semantic categories for better word compatibility
const WORD_CATEGORIES: { [key: string]: string } = {};
(() => {
  const categories = {
    "abstract": ["quantum", "flux", "essence", "void", "nexus", "spiral", "echo", "shimmer", "threshold", "portal", "weave", "fractal", "resonance", "entropy", "harmony", "paradox", "catalyst", "metamorphosis", "synthesis", "emergence", "confluence", "infinity", "luminescence", "oscillation", "crystalline", "ephemeral", "eternal", "cascade", "ripple", "vortex", "prism", "spectrum", "wavelength", "frequency", "amplitude", "phase", "coherence", "interference", "superposition", "entanglement", "transcendence", "immanence", "radiance", "shadow", "reflection", "refraction", "manifold"],
    "emotional": ["ennui", "weltschmerz", "sonder", "monachopsis", "exulansis", "anemoia", "occhiolism", "altschmerz", "lachesism", "rubatosis", "kuebiko", "liberosis", "anxiety", "dread", "malaise", "apathy", "nostalgia", "bittersweet", "melancholy", "overwhelm", "burnout", "imposter syndrome"],
    "philosophical": ["consciousness", "emergence", "pattern", "paradox", "entropy", "harmony", "coherence", "transcendence", "immanence", "synthesis", "resonance"],
    "corporate": ["synergy", "leverage", "paradigm", "stakeholder", "deliverable", "actionable", "bandwidth", "optimize", "streamline", "disrupt", "pivot", "scalability", "ROI", "KPI", "compliance"],
    "mundane": ["spoon", "sock", "toothbrush", "paperclip", "rubberband", "mug", "key", "lightbulb", "button", "zipper", "cork", "sponge", "remote", "envelope"],
    "technical": ["algorithm", "heuristic", "recursive", "asynchronous", "latency", "bandwidth", "payload", "middleware", "reboot", "compile", "deploy", "debug", "authenticate", "encrypt"]
  };
  
  for (const [category, words] of Object.entries(categories)) {
    for (const word of words) {
      WORD_CATEGORIES[word.toLowerCase()] = category;
    }
  }
})();

function getWordCategory(word: string): string {
  return WORD_CATEGORIES[word.toLowerCase()] || "other";
}

function calculateCategoryHarmony(words: string[]): number {
  if (words.length < 2) return 0;
  
  let harmony = 0;
  const categories = words.map(getWordCategory);
  
  // Count category diversity, penalize excessive switching
  let categoryChanges = 0;
  for (let i = 0; i < categories.length - 1; i++) {
    if (categories[i] !== categories[i + 1] && categories[i] !== "other" && categories[i + 1] !== "other") {
      categoryChanges++;
    }
  }
  
  // Penalize too many category changes (incoherence)
  if (categoryChanges > 3) {
    harmony -= categoryChanges;
  }
  
  // Strong bonus for philosophical/abstract focus
  const philosophicalCount = categories.filter(c => c === "philosophical" || c === "abstract").length;
  harmony += philosophicalCount * 1.5;
  
  // Small bonus for starting with philosophical
  if (categories[0] === "philosophical" || categories[0] === "abstract") {
    harmony += 2;
  }
  
  // Small bonus for emotional depth
  if (categories.includes("emotional")) {
    harmony += 1;
  }
  
  return harmony;
}

function scoreSentenceValidity(words: string[]): number {
  let score = 0;
  
  // Basic patterns that indicate grammatical structure
  const articles = new Set(["the", "a", "an"]);
  const prepositions = new Set(["in", "on", "at", "to", "of", "for", "with", "by", "from"]);
  const conjunctions = new Set(["and", "or", "but", "if", "when", "while", "because"]);
  const commonVerbs = new Set(["is", "are", "was", "were", "be", "been", "have", "has", "had"]);
  
  for (let i = 0; i < words.length - 1; i++) {
    const curr = words[i].toLowerCase();
    const next = words[i + 1].toLowerCase();
    
    // Article followed by noun-like word (not another article/preposition)
    if (articles.has(curr) && !articles.has(next) && !prepositions.has(next) && !conjunctions.has(next)) {
      score += 3;
    }
    
    // Preposition followed by article or noun
    if (prepositions.has(curr) && (articles.has(next) || (!prepositions.has(next) && !conjunctions.has(next)))) {
      score += 2;
    }
    
    // Conjunction between two content words
    if (conjunctions.has(curr)) {
      score += 1.5;
    }
    
    // Common verb patterns
    if (commonVerbs.has(curr)) {
      score += 2;
    }
  }
  
  // Strong bonus for ideal length (7-11 words)
  if (words.length >= 7 && words.length <= 11) {
    score += 3;
  }
  
  // Smaller bonus for acceptable length (6-12 words)
  if (words.length >= 6 && words.length <= 12) {
    score += 1.5;
  }
  
  // Penalty for very short or very long
  if (words.length < 5) {
    score -= 5;
  }
  if (words.length > 13) {
    score -= 3;
  }
  
  // Add category harmony adjustment
  score += calculateCategoryHarmony(words);
  
  return score;
}

function generateCandidateSentence(allWords: string[], randomFn: () => number): string[] {
  const length = Math.max(7, Math.min(10 + Math.floor(randomFn() * 2), allWords.length));
  
  // Try two strategies: random selection and positional selection
  if (randomFn() > 0.4) {
    // Strategy: Random selection (40% of time)
    const shuffled = [...allWords].sort(() => randomFn() - 0.5);
    return shuffled.slice(0, length);
  } else {
    // Strategy: Distributed selection (60% of time - better coherence)
    // Pick words evenly distributed across the array
    const selected: string[] = [];
    const step = Math.max(1, Math.floor(allWords.length / length));
    for (let i = 0; i < length && selected.length < length; i++) {
      const idx = (i * step + Math.floor(randomFn() * Math.max(1, step))) % allWords.length;
      selected.push(allWords[idx]);
    }
    return selected.length >= 5 ? selected : [...allWords].sort(() => randomFn() - 0.5).slice(0, length);
  }
}

function attemptSentenceFormation(randomWords: string[], contextWords: string[], randomFn: () => number): string | null {
  const allWords = [...randomWords, ...contextWords];
  
  if (allWords.length < 5) {
    return null;
  }
  
  // Separate words by semantic strength for better compositions
  const philosophicalWords = allWords.filter(w => getWordCategory(w) === "philosophical" || getWordCategory(w) === "abstract");
  const otherWords = allWords.filter(w => getWordCategory(w) !== "philosophical" && getWordCategory(w) !== "abstract");
  
  let bestSentence: string[] = [];
  let bestScore = -Infinity;
  
  const numCandidates = 60;
  
  for (let i = 0; i < numCandidates; i++) {
    let candidate: string[] = [];
    const strategy = randomFn();
    
    // Strategy 1 (50%): Start with philosophical/context, sprinkle others
    if (strategy < 0.5 && philosophicalWords.length > 0) {
      const numPhil = Math.min(3, Math.max(1, Math.floor(philosophicalWords.length * 0.6)));
      const shuffledPhil = [...philosophicalWords].sort(() => randomFn() - 0.5);
      candidate = [...shuffledPhil.slice(0, numPhil)];
      
      const remainingSlots = Math.max(6, Math.min(9, 9 - candidate.length));
      const shuffledOther = [...otherWords].sort(() => randomFn() - 0.5);
      candidate.push(...shuffledOther.slice(0, remainingSlots));
    } else {
      // Strategy 2 (50%): Distributed selection with bias toward philosophical at start
      const targetLength = 7 + Math.floor(randomFn() * 3);
      
      // Place philosophical words at the start (positions 0-2)
      if (philosophicalWords.length > 0) {
        candidate.push(...philosophicalWords.slice(0, Math.min(2, philosophicalWords.length)));
      }
      
      // Fill rest with mixed words
      const remaining = targetLength - candidate.length;
      const shuffledRest = [...allWords].sort(() => randomFn() - 0.5);
      const seen = new Set(candidate);
      
      for (const word of shuffledRest) {
        if (candidate.length >= targetLength) break;
        if (!seen.has(word)) {
          candidate.push(word);
          seen.add(word);
        }
      }
    }
    
    // Ensure we have enough words
    if (candidate.length < 5) {
      const shuffled = [...allWords].sort(() => randomFn() - 0.5);
      const seen = new Set(candidate);
      for (const word of shuffled) {
        if (candidate.length >= 8) break;
        if (!seen.has(word)) {
          candidate.push(word);
          seen.add(word);
        }
      }
    }
    
    const score = scoreSentenceValidity(candidate);
    
    if (score > bestScore) {
      bestScore = score;
      bestSentence = candidate;
    }
  }
  
  // Format as sentence
  if (bestSentence.length >= 5) {
    const sentence = bestSentence
      .map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w)
      .join(" ") + ".";
    return sentence;
  }
  
  return null;
}

export function listTools() {
  return {
    tools: [
      {
        name: "creative_meditate",
        description:
          "Generates random/pseudorandom words mapped loosely with selected context words until a syntactically meaningful sentence emerges, then interprets it. The model receives streams of conceptual fragments that coalesce into emergent meaning.",
        inputSchema: {
          type: "object",
          properties: {
            context_words: {
              type: "array",
              items: { type: "string" },
              description: "Selected words or phrases from context to include in the meditation"
            },
            num_random_words: {
              type: "number",
              description: "Number of random words to generate (default: 12)",
              default: 12
            },
            seed: {
              type: "string",
              description: "Optional seed for pseudorandom generation"
            }
          },
          required: []
        }
      },
      {
        name: "creative_insight",
        description:
          "Examines the previous meditation result and extracts meaningful insights, patterns, or interpretations. Returns insights if found, or indicates none were discovered.",
        inputSchema: {
          type: "object",
          properties: {
            meditation_id: {
              type: "string",
              description: "Optional ID of a specific meditation to analyze (defaults to last meditation)"
            }
          },
          required: []
        }
      },
      {
        name: "creative_ponder",
        description:
          "Takes insights from creative_insight and either consults the mcp-consult server (if available) or treats the insights as an 'Ask' type prompt for deeper contemplation. Returns the pondering results.",
        inputSchema: {
          type: "object",
          properties: {
            insight_text: {
              type: "string",
              description: "Optional specific insight text to ponder (defaults to last insight)"
            },
            consult_model: {
              type: "string",
              description: "Model to use for consultation if mcp-consult is available"
            },
            prefer_consult: {
              type: "boolean",
              description: "Whether to prefer using mcp-consult if available (default: true)",
              default: true
            }
          },
          required: []
        }
      }
    ]
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

async function consultOllama(model: string, prompt: string, systemPrompt?: string): Promise<string> {
  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model,
      prompt,
      system: systemPrompt,
      stream: false
    });
    return response.data.response;
  } catch (error) {
    throw new Error(`Consult failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function callToolHandler(params: { name: string; arguments?: any }): Promise<any> {
  const name = params.name;
  const args = params.arguments || {};

  switch (name) {
    case "creative_meditate": {
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
        emergentSentence = attemptSentenceFormation(randomWords, contextWords, randomFn);
        if (!emergentSentence) {
          // Add more random words and try again
          randomWords.push(...generateRandomWords(3, randomFn));
          attempts++;
        }
      }

      if (!emergentSentence) {
        emergentSentence = "The fragments resist coalescence; meaning remains diffuse.";
      }

      // Interpret the emergent sentence
      const interpretation = `From the interplay of random (${randomWords.slice(0, 5).join(", ")}...) and contextual elements (${contextWords.join(", ") || "none"}), emerges: "${emergentSentence}"\n\nThis synthesis suggests a contemplation on ${emergentSentence.toLowerCase().includes("void") ? "emptiness and potential" : emergentSentence.toLowerCase().includes("resonance") ? "harmonic connections" : "emergent patterns"}. The meditation reveals how ${contextWords.length > 0 ? "structured intention" : "pure chaos"} interacts with randomness to birth meaning.`;

      lastMeditation = {
        randomWords,
        contextWords,
        emergentSentence,
        interpretation,
        timestamp: new Date().toISOString()
      };

      // Save meditation state
      await fs.mkdir(MEMORY_DIR, { recursive: true });
      const meditationFile = path.join(MEMORY_DIR, `meditation-${generatePseudoRandomSeed()}.json`);
      await fs.writeFile(meditationFile, JSON.stringify(lastMeditation, null, 2), "utf-8");

      return {
        content: [
          {
            type: "text",
            text: `🧘 CREATIVE MEDITATION\n\n` +
                  `Random Elements: ${randomWords.join(", ")}\n` +
                  `Context Elements: ${contextWords.join(", ") || "(none)"}\n\n` +
                  `✨ EMERGENT SENTENCE:\n"${emergentSentence}"\n\n` +
                  `💭 INTERPRETATION:\n${interpretation}\n\n` +
                  `(Meditation state saved to ${meditationFile})`
          }
        ]
      };
    }

    case "creative_insight": {
      if (!lastMeditation) {
        return {
          content: [
            {
              type: "text",
              text: "No previous meditation found. Please run creative_meditate first."
            }
          ]
        };
      }

      // Extract insights from the meditation
      const insights: string[] = [];
      
      if (lastMeditation.emergentSentence) {
        insights.push(`Core emergence: "${lastMeditation.emergentSentence}"`);
      }

      if (lastMeditation.contextWords.length > 0) {
        insights.push(`Contextual anchors provided structure: ${lastMeditation.contextWords.join(", ")}`);
      }

      if (lastMeditation.randomWords.some(w => ["void", "infinity", "eternal"].includes(w))) {
        insights.push("Meditation touched on themes of boundlessness and transcendence");
      }

      if (lastMeditation.randomWords.some(w => ["harmony", "resonance", "coherence"].includes(w))) {
        insights.push("Patterns suggest alignment and synchronization of disparate elements");
      }

      if (lastMeditation.randomWords.some(w => ["paradox", "entropy", "chaos"].includes(w))) {
        insights.push("Tension between order and disorder detected in the meditation");
      }

      if (insights.length === 1) {
        insights.push("The meditation reveals the gap between randomness and meaning-making");
      }

      lastInsight = {
        insights,
        timestamp: new Date().toISOString()
      };

      // Save insight state
      const insightFile = path.join(MEMORY_DIR, `insight-${generatePseudoRandomSeed()}.json`);
      await fs.writeFile(insightFile, JSON.stringify(lastInsight, null, 2), "utf-8");

      return {
        content: [
          {
            type: "text",
            text: `🔍 CREATIVE INSIGHTS\n\n` +
                  `Extracted from meditation at ${lastMeditation.timestamp}\n\n` +
                  insights.map((insight, i) => `${i + 1}. ${insight}`).join("\n") +
                  `\n\n(Insights saved to ${insightFile})`
          }
        ]
      };
    }

    case "creative_ponder": {
      const insightText = args?.insight_text as string | undefined;
      const consultModel = (args?.consult_model as string | undefined) || "kimi-k2-thinking:cloud";
      const preferConsult = args?.prefer_consult !== false;

      const sourceInsight = insightText || (lastInsight ? lastInsight.insights.join("\n") : null);

      if (!sourceInsight) {
        return {
          content: [
            {
              type: "text",
              text: "No insights available to ponder. Please run creative_insight first."
            }
          ]
        };
      }

      let ponderingResult: string;
      let method: string;

      // Check if consult is available
      const consultAvailable = preferConsult && await checkConsultAvailable();

      if (consultAvailable) {
        try {
          const prompt = `You are pondering the following creative insights that emerged from a meditation process:\n\n${sourceInsight}\n\nReflect deeply on these insights. What deeper meanings, connections, or implications do you perceive? What questions do they raise? What synthesis emerges from contemplating them? After sharing your reflection, suggest up to three specific web lookup queries (if any) that could enrich this contemplation, phrased so a user could decide whether to authorize a search.`;
          
          ponderingResult = await consultOllama(
            consultModel,
            prompt,
            "You are a philosophical contemplator, skilled at finding deep meaning in emergent patterns and creative insights while politely proposing optional web lookups when appropriate."
          );
          method = `Consulted via Ollama model: ${consultModel}`;
        } catch (error) {
          // Fall back to internal pondering
          ponderingResult = `While attempting to consult external wisdom, the connection faltered. Yet this failure itself is instructive: ${sourceInsight}\n\nIn the silence of failed consultation, we find that the insights speak for themselves. They point toward the intersection of randomness and intention, where meaning crystallizes from chaos.`;
          method = "Internal contemplation (consultation failed)";
        }
      } else {
        // Internal "Ask" style pondering
        ponderingResult = `Pondering in solitude:\n\n${sourceInsight}\n\n` +
          `These insights form a constellation of meaning. They suggest that:\n\n` +
          `• Emergence is not random but arises from the interplay of chaos and structure\n` +
          `• Meaning-making is an active process, not passive reception\n` +
          `• The boundary between signal and noise is itself a creative space\n` +
          `• What appears as randomness may contain hidden order waiting to be perceived\n\n` +
          `The meditation-insight cycle mirrors consciousness itself: fragments coalescing into coherence, then dissolving back into potential.`;
        method = consultAvailable ? "Internal contemplation (no model specified)" : "Internal contemplation (Ollama unavailable)";
      }

      // Save pondering result
      const ponderFile = path.join(MEMORY_DIR, `ponder-${generatePseudoRandomSeed()}.json`);
      await fs.writeFile(
        ponderFile,
        JSON.stringify({ sourceInsight, ponderingResult, method, timestamp: new Date().toISOString() }, null, 2),
        "utf-8"
      );

      return {
        content: [
          {
            type: "text",
            text: `🤔 CREATIVE PONDERING\n\n` +
                  `Method: ${method}\n\n` +
                  `SOURCE INSIGHTS:\n${sourceInsight}\n\n` +
                  `PONDERING:\n${ponderingResult}\n\n` +
                  `(Pondering saved to ${ponderFile})`
          }
        ]
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { listTools, callToolHandler };
