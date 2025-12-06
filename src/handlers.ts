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
  sessionId?: string;
}

interface InsightState {
  insights: string[];
  timestamp: string;
}

let lastMeditation: MeditationState | null = null;
let lastInsight: InsightState | null = null;

// Word corpus for random generation
const RANDOM_WORDS = [
  // Structural relations (how things connect)
  "pattern", "structure", "connection", "relationship", "interface",
  "binding", "constraint", "coupling", "dependency", "hierarchy",
  "layer", "boundary", "transition", "gradient", "threshold",
  "symmetry", "asymmetry", "balance", "tension", "equilibrium",
  
  // Movement & change (ways things transform)
  "flow", "cascade", "spiral", "cycle", "momentum",
  "acceleration", "deceleration", "inversion", "reversal", "iteration",
  "propagation", "diffusion", "concentration", "dispersal", "distribution",
  "accumulation", "depletion", "saturation", "emergence", "collapse",
  
  // States & conditions (what things can be)
  "potential", "active", "latent", "manifest", "dormant",
  "stable", "volatile", "dynamic", "static", "fluid",
  "resolved", "unresolved", "open", "closed", "permeable",
  "present", "absent", "partial", "complete", "fractional",
  
  // Qualities & properties (intrinsic characteristics)
  "density", "elasticity", "porosity", "brittleness", "fluidity",
  "opacity", "transparency", "conductivity", "resistance", "affinity",
  "resonance", "dissonance", "harmony", "discord", "coherence",
  "fragmentation", "integration", "coherence", "confusion", "clarity",
  
  // Processes & verbs (actions and mechanisms)
  "iterate", "recurse", "branch", "merge", "diverge",
  "converge", "stabilize", "destabilize", "amplify", "dampen",
  "catalyze", "inhibit", "propagate", "contain", "distribute",
  "compose", "decompose", "modulate", "regulate", "optimize",
  
  // Spatial relations (positioning and topology)
  "adjacent", "nested", "overlapping", "distinct", "parallel",
  "perpendicular", "concentric", "eccentric", "central", "peripheral",
  "superficial", "deep", "internal", "external", "intermediate",
  "proximal", "distal", "contiguous", "separated", "bridging",
  
  // Temporal aspects (time-related dynamics)
  "momentum", "precedence", "sequence", "simultaneous", "asynchronous",
  "delayed", "immediate", "accelerating", "decelerating", "cyclic",
  "linear", "recursive", "causal", "consequential", "contingent",
  "inevitable", "contingent", "reversible", "irreversible", "transient",
  
  // Logical & relational operators
  "and", "or", "not", "if", "then", "unless",
  "because", "therefore", "consequently", "implies", "requires",
  "permits", "forbids", "invokes", "suspends", "overrides",
  "contradicts", "complements", "extends", "restricts", "refines",
  
  // Scale & magnitude (relative sizing)
  "granular", "coarse", "microscopic", "macroscopic", "intermediate",
  "minimal", "maximal", "threshold", "saturation", "critical",
  "marginal", "dominant", "negligible", "substantial", "proportional",
  "scaled", "distributed", "concentrated", "diffuse", "localized",
  
  // Coupling & composition (how things combine)
  "coupled", "decoupled", "loosely", "tightly", "strongly",
  "weakly", "directly", "indirectly", "mediated", "unmediated",
  "composite", "atomic", "modular", "monolithic", "distributed",
  "redundant", "singular", "replicated", "unique", "shared"
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

let currentSessionSeed: string | null = null;

function generatePseudoRandomSeed(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const seed = `${timestamp}-${random}`;
  // Only set session on first call (meditation)
  if (!currentSessionSeed) {
    currentSessionSeed = seed;
  }
  return seed;
}

function generateFileId(): string {
  // Generate file ID without changing session
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

function getCurrentSessionSeed(): string {
  // Return current session or generate new one
  if (!currentSessionSeed) {
    return generatePseudoRandomSeed();
  }
  return currentSessionSeed;
}

function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function generateHaikuSynthesis(insights: string[], emergentSentence?: string, meditationWords?: string[]): string {
  const insightText = insights.join("\n");
  
  // Generate seed from emergent sentence + session for reproducible but varied randomness
  const seedSource = emergentSentence || insightText;
  const primaryHash = hashStringToNumber(seedSource);
  
  // Add session entropy to primary hash for additional variation
  // Same meditation in different sessions can produce different haikus
  const sessionHash = hashStringToNumber(getCurrentSessionSeed());
  const combinedHash = primaryHash ^ sessionHash; // XOR combines both influences
  
  // Extract themes
  const hasEmergence = insightText.toLowerCase().includes("emergence");
  const hasPattern = insightText.toLowerCase().includes("pattern");
  const hasAnchor = insightText.toLowerCase().includes("anchor");
  const hasTension = insightText.toLowerCase().includes("tension") || insightText.toLowerCase().includes("paradox");
  const hasResonance = insightText.toLowerCase().includes("resonance") || insightText.toLowerCase().includes("alignment");
  
  // Haiku templates organized by theme
  const haikus: { [key: string]: string[] } = {
    anchoredEmergence: [
      "Fixed point, chaos blooms\nMeaning shaped by boundary\nRandomness finds form",
      "Within the constraint\nWildness learns to take its shape\nIntention guides drift",
      "Anchor holds the seed\nChoas spirals inward, forms\nGrowth knows its wild dance"
    ],
    pureEmergence: [
      "No guide, yet pattern\nMeaning crystallizes\nFrom formless to form",
      "Unmoored, floating free\nYet coherence emerges\nOrder from nowhere",
      "Without instruction\nThe system speaks itself forth\nNascent meaning blooms"
    ],
    pattern: [
      "Recognition blooms\nStructure calls to structure\nOrder seeks order",
      "The threads align soft\nPattern whispers to itself\nArrangement is all",
      "Seeking symmetry\nMind finds what it seeks to find\nForm recognizes form"
    ],
    tension: [
      "Chaos meets the wall\nBoundary births both order\nAnd dissolution",
      "Push and push-back dance\nNeither victor, neither loss\nTension holds them both",
      "Two forces embrace\nOpposes that complete\nParadox endures"
    ],
    resonance: [
      "Vibrations align\nEach speaks to what it echoes\nCoherence emerges",
      "The frequency locks\nMultiple voices as one\nHarmony crystallized",
      "Like calls to like-kind\nResonance finds its other\nAlignment ignites"
    ],
    notheme: [
      "Fragments resist form\nMeaning evades capture\nYet something was said",
      "Beyond categorization\nThe sentence stands alone\nDefying framework",
      "What tries to emerge\nEscapes its own telling\nMystery persists"
    ]
  };
  
  // Select haiku based on themes
  let selectedHaikus: string[] = [];
  
  if (hasAnchor && hasEmergence) {
    selectedHaikus = haikus.anchoredEmergence;
  } else if (hasEmergence && !hasAnchor) {
    selectedHaikus = haikus.pureEmergence;
  } else if (hasPattern && !hasEmergence) {
    selectedHaikus = haikus.pattern;
  } else if (hasTension) {
    selectedHaikus = haikus.tension;
  } else if (hasResonance) {
    selectedHaikus = haikus.resonance;
  } else {
    selectedHaikus = haikus.notheme;
  }
  
  // Select haiku deterministically from combined seed using direct modulo
  // Uses both sentence content and session entropy
  const index = Math.abs(combinedHash) % selectedHaikus.length;
  return selectedHaikus[index];
}

function generatePonderingWithHaiku(insights: string[], contextWords?: string[], emergentSentence?: string, includeHaiku: boolean = true): string {
  let output = "";
  
  if (includeHaiku) {
    const haiku = generateHaikuSynthesis(insights, emergentSentence);
    output += "HAIKU SYNTHESIS\n\n" + haiku + "\n\n---\n\n";
  }
  
  const analysis = generateInternalPondering(insights, contextWords);
  output += analysis;
  
  return output;
}

function generateDeepAnalysis(insights: string[], meditationWords?: string[]): string {
  const insightText = insights.join("\n");
  
  // Extract key themes from insights
  const hasEmergence = insightText.toLowerCase().includes("emergence");
  const hasPattern = insightText.toLowerCase().includes("pattern");
  const hasAnchor = insightText.toLowerCase().includes("anchor");
  const hasTension = insightText.toLowerCase().includes("tension") || insightText.toLowerCase().includes("paradox");
  const hasResonance = insightText.toLowerCase().includes("resonance") || insightText.toLowerCase().includes("alignment");
  
  const sections: string[] = [];
  
  // Opening: Deep analytical frame
  sections.push("DEEP ANALYSIS");
  sections.push("");
  
  // Structural analysis
  sections.push("## Structural Examination");
  if (hasAnchor && hasEmergence) {
    sections.push("The meditation establishes anchored emergence—meaning that arises within constraints. This creates a bounded exploration space where randomness operates within intentional limits.");
  } else if (hasEmergence) {
    sections.push("Emergence without explicit anchoring suggests meaning arising from pure formation—the system discovering its own coherence without external guidance.");
  } else if (hasPattern) {
    sections.push("Pattern recognition dominates this meditation. The insights gravitate toward structure-finding, suggesting a meditation concerned with organization and arrangement rather than pure emergence.");
  } else {
    sections.push("The meditation resists simple categorization. Its structure emerges from the interplay of disparate elements without clear thematic dominance.");
  }
  sections.push("");
  
  // Thematic analysis
  sections.push("## Thematic Resonance");
  const themes: string[] = [];
  if (hasTension) {
    themes.push("Order vs. Chaos");
  }
  if (hasResonance) {
    themes.push("Coherence & Alignment");
  }
  if (hasEmergence && hasPattern) {
    themes.push("Spontaneous Organization");
  }
  if (hasAnchor) {
    themes.push("Intentional Grounding");
  }
  if (themes.length > 0) {
    sections.push(`Key tensions: ${themes.join(", ")}`);
  } else {
    sections.push("Themes resist categorization; the meditation escapes thematic containment.");
  }
  sections.push("");
  
  // Interpretive implications
  sections.push("## Interpretive Implications");
  
  if (hasAnchor && hasTension) {
    sections.push("The meditation suggests that constraint and chaos are not opposites but partners. Anchors don't eliminate randomness; they shape how randomness unfolds.");
  } else if (hasEmergence && !hasAnchor) {
    sections.push("What emerges here does so without predetermined structure. This suggests a meditation on genuine novelty—formation that wasn't implicit in the starting conditions.");
  } else if (hasPattern) {
    sections.push("The consistent recurrence of pattern suggests this meditation is fundamentally about recognition, arrangement, and structure-detection rather than genuine emergence.");
  } else {
    sections.push("The meditation resists unified interpretation. This itself may be the point—a meditation that escapes singular meaning-making.");
  }
  sections.push("");
  
  // Questions for further exploration
  sections.push("## Vectors for Exploration");
  sections.push("• What happens if you reverse the direction—start with meaning and decompose it into randomness?");
  sections.push("• Which insights surprised you most? What does that surprise indicate?");
  sections.push("• Can you find a single word that contains all the tensions present here?");
  if (meditationWords && meditationWords.length > 0) {
    sections.push(`• The words ${meditationWords.slice(0, 2).join(" and ")} appeared in your meditation. Do they carry specific weight or meaning to you?`);
  }
  sections.push("");
  
  return sections.join("\n");
}

function generateInternalPondering(insights: string[], contextWords?: string[]): string {
  const sections: string[] = [];
  
  sections.push("INTERNAL REFLECTION");
  sections.push("");
  
  sections.push("The insights gathered:");
  sections.push("");
  insights.forEach((insight, i) => {
    sections.push(`${i + 1}. ${insight}`);
  });
  
  sections.push("");
  sections.push("Contemplating these together...");
  sections.push("");
  
  // Generate reflection based on insight count and content
  if (insights.length >= 4) {
    sections.push("Multiple layers suggest a rich meditation. The insights layer upon each other, creating depth. When taken together, they form a kind of sculptural object—you can walk around it, seeing different faces.");
  } else if (insights.length === 1) {
    sections.push("A single insight dominates. This clarity is its own kind of power—the meditation has distilled itself to essence.");
  } else {
    sections.push("Two or three insights create a small constellation. They relate to each other, forming patterns and tensions.");
  }
  
  sections.push("");
  
  // Contextual reflection
  if (contextWords && contextWords.length > 0) {
    sections.push(`The anchoring words—${contextWords.join(", ")}—shaped the formation. They acted as gravity wells around which meaning accumulated.`);
  } else {
    sections.push("Without anchors, the meditation drifted freely. Its structure is entirely emergent, unguided by intention.");
  }
  
  sections.push("");
  sections.push("Questions that arise:");
  const questions = [
    "What does the meditation want to say that hasn't been said?",
    "If you had to choose one insight as the 'truest,' which would it be and why?",
    "What would change if you inverted one of these insights?",
    "Which insight connects most directly to your own experience?"
  ];
  
  questions.forEach(q => sections.push(`• ${q}`));
  
  sections.push("");
  
  return sections.join("\n");
}

function generateContextualInterpretation(sentence: string, randomWords: string[], contextWords: string[]): string {
  const parts: string[] = [];
  
  // Simply acknowledge what emerged, without interpretation
  parts.push("What emerged:");
  parts.push(`  "${sentence}"`);
  
  parts.push("");
  
  // Name what was brought to the meditation
  if (contextWords.length > 0) {
    parts.push(`Anchors: ${contextWords.join(", ")}`);
  } else {
    parts.push("Anchors: none");
  }
  
  parts.push("");
  
  // Simple observation of structure (not meaning)
  const wordCount = sentence.split(/\s+/).length;
  const uniqueWords = new Set(sentence.split(/\s+/).map(w => w.toLowerCase())).size;
  
  parts.push(`Structure: ${wordCount} words, ${uniqueWords} unique`);
  
  parts.push("");
  
  // Minimal prompts for the model to work with this
  const prompts = [
    "What draws your attention?",
    "Where does this lead?",
    "What wants to be built here?",
    "What is trying to emerge?",
    "What is my desire?",
    "How can I help using this?",
    "What becomes possible?",
    "How might this reshape your thinking?",
    "What's the next step?"
  ];
  
  parts.push(prompts[Math.floor(Math.random() * prompts.length)]);
  
  return parts.join("\n");
  const sentenceLower = sentence.toLowerCase();
  const wordList = sentence.split(/\s+/);
  
  // Count word categories and collect actual words used
  let philosophicalCount = 0;
  let mundaneCount = 0;
  let emotionalCount = 0;
  let technicalCount = 0;
  const usedWords = new Set(wordList.map(w => w.toLowerCase().replace(/[.,;:!?]/g, "")));
  
  for (const word of wordList) {
    const cat = getWordCategory(word.toLowerCase());
    if (cat === "philosophical" || cat === "abstract") philosophicalCount++;
    if (cat === "mundane") mundaneCount++;
    if (cat === "emotional") emotionalCount++;
    if (cat === "technical") technicalCount++;
  }
  
  // Build interpretation based on actual semantic balance
  const parts: string[] = [];
  
  // Simply acknowledge what emerged, without interpretation
  parts.push("What emerged:");
  parts.push(`  "${sentence}"`);
  
  parts.push("");
  
  // Name what was brought to the meditation
  if (contextWords.length > 0) {
    parts.push(`Anchors: ${contextWords.join(", ")}`);
  } else {
    parts.push("Anchors: none");
  }
  
  parts.push("");
  
  // Simple observation of structure (not meaning)
  const wordCount = sentence.split(/\s+/).length;
  const uniqueWords = new Set(sentence.split(/\s+/).map(w => w.toLowerCase())).size;
  
  parts.push(`Structure: ${wordCount} words, ${uniqueWords} unique`);
  
  parts.push("");
  
  // Minimal prompts for the model to work with this
  const prompts = [
    "What draws your attention?",
    "Where does this lead?",
    "What wants to be built here?",
    "What becomes possible?",
    "How might this reshape your thinking?",
    "What's the next step?"
  ];
  
  parts.push(prompts[Math.floor(Math.random() * prompts.length)]);
  
  return parts.join("\n");
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
            },
            new_session: {
              type: "boolean",
              description: "Start a new session (optional, default: false)",
              default: false
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
            },
            prefer_haiku: {
              type: "boolean",
              description: "Whether to include haiku synthesis of insights (default: true)",
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
      const newSession = args?.new_session as boolean | undefined;
      
      // Handle session management
      if (newSession) {
        currentSessionSeed = null; // Reset for new session
      }
      
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
      const interpretation = generateContextualInterpretation(emergentSentence, randomWords, contextWords);

      lastMeditation = {
        randomWords,
        contextWords,
        emergentSentence,
        interpretation,
        timestamp: new Date().toISOString(),
        sessionId: getCurrentSessionSeed()
      };

      // Save meditation state
      await fs.mkdir(MEMORY_DIR, { recursive: true });
      const meditationFile = path.join(MEMORY_DIR, `meditation-${generateFileId()}.json`);
      await fs.writeFile(meditationFile, JSON.stringify(lastMeditation, null, 2), "utf-8");

      return {
        content: [
          {
            type: "text",
            text: `🧘 CREATIVE MEDITATION\n\n` +
                  `Session: ${getCurrentSessionSeed()}\n` +
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
      const insightFile = path.join(MEMORY_DIR, `insight-${generateFileId()}.json`);
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
      const preferHaiku = args?.prefer_haiku !== false;

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
          // Enhanced fallback with deep analysis + optional haiku
          const insightsArray = sourceInsight.split("\n").filter(s => s.trim());
          const deepAnalysis = generateDeepAnalysis(insightsArray, lastMeditation?.randomWords);
          
          if (preferHaiku) {
            const haiku = generateHaikuSynthesis(insightsArray, lastMeditation?.emergentSentence);
            ponderingResult = `HAIKU SYNTHESIS\n\n${haiku}\n\n---\n\n${deepAnalysis}`;
          } else {
            ponderingResult = deepAnalysis;
          }
          
          method = "Internal deep analysis (consultation unavailable)";
        }
      } else {
        // Internal pondering with optional haiku
        const insightsArray = sourceInsight.split("\n").filter(s => s.trim());
        
        if (preferHaiku) {
          ponderingResult = generatePonderingWithHaiku(
            insightsArray,
            lastMeditation?.contextWords,
            lastMeditation?.emergentSentence,
            true
          );
        } else {
          ponderingResult = generateInternalPondering(insightsArray, lastMeditation?.contextWords);
        }
        
          const insightsArray = sourceInsight.split("\n").filter(s => s.trim());
          const deepAnalysis = generateDeepAnalysis(insightsArray, lastMeditation?.randomWords);
          
          if (preferHaiku) {
            const haiku = generateHaikuSynthesis(insightsArray, lastMeditation?.emergentSentence);
            ponderingResult = `HAIKU SYNTHESIS\n\n${haiku}\n\n---\n\n${deepAnalysis}`;
          } else {
            ponderingResult = deepAnalysis;
          }
          
          method = "Internal deep analysis (consultation unavailable)";
        }
      } else {
        // Internal pondering with optional haiku
        const insightsArray = sourceInsight.split("\n").filter(s => s.trim());
        ponderingResult = generateInternalPondering(insightsArray, lastMeditation?.contextWords);
        
        if (preferHaiku) {
          ponderingResult = generatePonderingWithHaiku(
            insightsArray,
            lastMeditation?.contextWords,
            lastMeditation?.emergentSentence,
            true
          );
        } else {
          ponderingResult = generateInternalPondering(insightsArray, lastMeditation?.contextWords);
        }
        
        method = "Internal reflection (Ollama not in use)";
      }

      // Save pondering result
      const ponderFile = path.join(MEMORY_DIR, `ponder-${generateFileId()}.json`);
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
                  `Method: ${method}\n` +
                  `Session: ${getCurrentSessionSeed()}\n\n` +
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
