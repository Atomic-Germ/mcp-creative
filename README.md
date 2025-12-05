# MCP Creative Meditation Server

An MCP (Model Context Protocol) server that provides creative meditation and insight generation tools. This server enables models to engage in contemplative processes that blend randomness with intention to produce emergent meaning.

## Overview

The creative meditation process consists of three interconnected tools:

1. **`creative_meditate`** - Generates a meditation by combining random conceptual fragments with contextual elements until a meaningful sentence emerges, then interprets it
2. **`creative_insight`** - Analyzes the previous meditation to extract meaningful patterns and insights
3. **`creative_ponder`** - Takes insights and either consults an external Ollama model (via mcp-consult if available) or performs internal contemplation

## Refinements for Coherence (v1.1)

Recent updates improve the balance between creative chaos and meaningful coherence:

### Algorithm Improvements

1. **Semantic Categorization**: Words are now organized by semantic category (philosophical, abstract, emotional, technical, etc.), allowing the algorithm to favor thematically compatible selections

2. **Category Harmony Scoring**: The sentence validity scoring now includes:
   - Bonuses for philosophical and abstract word prominence
   - Penalties for excessive category switching
   - Preference for meaningful word combinations
   
3. **Dual Strategy Generation**: Candidate sentences use two strategies:
   - **Strategy 1** (50%): Starts with philosophical/context words, then adds supporting random words
   - **Strategy 2** (50%): Uses distributed selection with bias toward philosophical/abstract positioning
   
4. **Enhanced Candidate Evaluation**: Increased from 20 to 60 candidate sentences per meditation, with stronger evaluation criteria prioritizing:
   - Ideal length (7-11 words for natural phrasing)
   - Grammatical structure patterns
   - Semantic coherence
   - Thematic consistency

### Result

These refinements maintain the creative, exploratory nature of the meditation while producing more coherent, meaningful emergent sentences. Context words are now naturally integrated, and the random elements are selected for thematic resonance rather than pure randomness.

---



### creative_meditate

Generates random/pseudorandom words mapped with selected context words until a syntactically meaningful sentence emerges, then interprets it.

**Parameters:**
- `context_words` (array, optional): Selected words or phrases from context to include
- `num_random_words` (number, optional): Number of random words to generate (default: 12)
- `seed` (string, optional): Seed for pseudorandom generation

**Returns:** The emergent sentence and its interpretation

### creative_insight

Examines the previous meditation result and extracts meaningful insights, patterns, or interpretations.

**Parameters:**
- `meditation_id` (string, optional): ID of specific meditation to analyze (defaults to last meditation)

**Returns:** List of insights discovered in the meditation

### creative_ponder

Takes insights from creative_insight and either consults mcp-consult (if available) or treats insights as an 'Ask' type prompt for deeper contemplation.

**Parameters:**
- `insight_text` (string, optional): Specific insight text to ponder (defaults to last insight)
- `consult_model` (string, optional): Ollama model to use if mcp-consult is available
- `prefer_consult` (boolean, optional): Whether to prefer mcp-consult if available (default: true)

**Returns:** Deep pondering results from either consultation or internal reflection

## Installation

```bash
npm install
npm run build
```

## Usage

### As an MCP Server

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "creative": {
      "command": "node",
      "args": ["/path/to/mcp-creative/dist/index.js"]
    }
  }
}
```

### Example Flow

```javascript
// 1. Meditate with some context
creative_meditate({
  context_words: ["consciousness", "pattern"],
  num_random_words: 15
})

// 2. Extract insights
creative_insight()

// 3. Ponder deeply (with Ollama if available)
creative_ponder({
  consult_model: "llama2"
})
```

## Integration with mcp-consult

If mcp-consult is available (Ollama running at `http://localhost:11434`), `creative_ponder` will automatically use it for deeper contemplation. Otherwise, it falls back to internal reflection.

## Environment Variables

- `OLLAMA_BASE_URL` - Ollama API URL (default: `http://localhost:11434`)
- `MEMORY_DIR` - Directory for saving meditation/insight states (default: `/tmp/mcp-creative-memory`)

## Memory

All meditations, insights, and ponderings are saved to the memory directory with timestamps, allowing you to track the creative journey over time.

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Build
npm run build
```

## License

MIT
This could be worryingly powerful or hilariously random; likely both. Let it meditate
