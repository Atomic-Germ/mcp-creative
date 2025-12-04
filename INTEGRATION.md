# Integration Examples

## How the Creative Tools Work Together

### Basic Flow

```
creative_meditate → creative_insight → creative_ponder
```

### 1. Standalone Mode (No Ollama)

When Ollama is not available, all three tools work independently:

- `creative_meditate` generates emergent sentences from random + context words
- `creative_insight` analyzes meditation patterns
- `creative_ponder` performs internal philosophical reflection

### 2. With Ollama Available

When Ollama is running, `creative_ponder` can consult external models:

```javascript
// Ponder with Ollama consultation
creative_ponder({
  consult_model: "llama2",
  prefer_consult: true
})
```

### 3. With mcp-consult Server

When both mcp-creative and mcp-consult are configured, they work seamlessly:

- The creative server checks for Ollama availability
- If found, it uses the same endpoint that mcp-consult would use
- This provides dual consultation capability

## Example Workflow Scenarios

### Scenario 1: Exploring a Concept

```
1. creative_meditate({ context_words: ["time", "memory", "recursion"] })
2. creative_insight()
3. creative_ponder({ consult_model: "mistral" })
```

### Scenario 2: Iterative Refinement

```
1. creative_meditate({ context_words: ["complexity"], num_random_words: 20 })
2. creative_insight()
3. creative_meditate({ context_words: [<words from insight>], num_random_words: 15 })
4. creative_insight()
5. creative_ponder()
```

### Scenario 3: Seeded Exploration

```
1. creative_meditate({ 
     context_words: ["emergence"], 
     seed: "experiment-001",
     num_random_words: 10 
   })
2. creative_insight()
3. creative_meditate({ 
     context_words: ["emergence"], 
     seed: "experiment-001",  // Same seed = reproducible randomness
     num_random_words: 10 
   })
```

## Memory Persistence

All operations save their state to `MEMORY_DIR`:

```
/tmp/mcp-creative-memory/
├── meditation-{timestamp}-{id}.json
├── insight-{timestamp}-{id}.json
└── ponder-{timestamp}-{id}.json
```

This allows:
- Tracking creative journeys over time
- Reviewing past meditations
- Building on previous insights
- Analyzing patterns in the creative process itself

## Integration with Other MCP Servers

The creative server is designed to complement:

- **mcp-consult**: For deeper AI-powered contemplation
- **mcp-remember**: For persistent memory across sessions
- **mcp-filesystem**: For organizing meditation outputs
- Any other MCP server that works with text and contemplative processes

## Philosophy of Use

This isn't a traditional tool - it's a contemplative space. Use it when:

- Exploring emergent thinking
- Breaking through mental blocks
- Generating creative connections
- Practicing "digital meditation"
- Discovering unexpected insights through controlled randomness

The randomness isn't noise - it's a catalyst for the mind to find patterns it wouldn't normally see.
