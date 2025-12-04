# API Reference

## Tools

### creative_meditate

Generates a creative meditation by combining random conceptual fragments with contextual words until a meaningful sentence emerges.

**Input Schema:**

```typescript
{
  context_words?: string[];      // Words/phrases from context to include
  num_random_words?: number;     // Number of random words (default: 12)
  seed?: string;                 // Optional seed for reproducibility
}
```

**Returns:**

```typescript
{
  content: [{
    type: "text",
    text: string  // Contains:
                  // - Random elements used
                  // - Context elements used
                  // - Emergent sentence
                  // - Interpretation
                  // - File path where state was saved
  }]
}
```

**Example:**

```javascript
await callTool({
  name: "creative_meditate",
  arguments: {
    context_words: ["consciousness", "pattern"],
    num_random_words: 15,
    seed: "session-42"
  }
});
```

**State Saved:**

```json
{
  "randomWords": ["quantum", "flux", "..."],
  "contextWords": ["consciousness", "pattern"],
  "emergentSentence": "Pattern quantum consciousness...",
  "interpretation": "From the interplay...",
  "timestamp": "2025-12-04T17:40:49.002Z"
}
```

---

### creative_insight

Analyzes the most recent meditation to extract meaningful insights and patterns.

**Input Schema:**

```typescript
{
  meditation_id?: string;  // Optional specific meditation ID
                          // Defaults to last meditation
}
```

**Returns:**

```typescript
{
  content: [{
    type: "text",
    text: string  // Contains numbered list of insights
  }]
}
```

**Insight Detection:**

The tool looks for:
- Core emergent sentences
- Contextual anchoring patterns
- Themes of boundlessness/transcendence
- Harmony and resonance patterns
- Paradox and entropy tensions
- Meta-patterns about meaning-making

**Example:**

```javascript
await callTool({
  name: "creative_insight",
  arguments: {}
});
```

**State Saved:**

```json
{
  "insights": [
    "Core emergence: \"...\"",
    "Contextual anchors provided structure: ...",
    "Patterns suggest alignment..."
  ],
  "timestamp": "2025-12-04T17:40:49.004Z"
}
```

---

### creative_ponder

Takes insights and performs deep contemplation, either via Ollama consultation or internal reflection.

**Input Schema:**

```typescript
{
  insight_text?: string;       // Specific insight to ponder
                              // Defaults to last insight
  consult_model?: string;     // Ollama model to use (e.g., "llama2")
  prefer_consult?: boolean;   // Prefer external consultation (default: true)
}
```

**Returns:**

```typescript
{
  content: [{
    type: "text",
    text: string  // Contains:
                  // - Method used (internal/external)
                  // - Source insights
                  // - Pondering results
                  // - File path
  }]
}
```

**Behavior:**

1. If `prefer_consult=true` AND `consult_model` specified AND Ollama available:
   - Consults Ollama with philosophical system prompt
   
2. If Ollama unavailable OR `prefer_consult=false` OR no model specified:
   - Performs internal contemplative analysis
   
3. If consultation fails:
   - Falls back to internal pondering gracefully

**Example (with consultation):**

```javascript
await callTool({
  name: "creative_ponder",
  arguments: {
    consult_model: "llama2",
    prefer_consult: true
  }
});
```

**Example (internal only):**

```javascript
await callTool({
  name: "creative_ponder",
  arguments: {
    prefer_consult: false
  }
});
```

**State Saved:**

```json
{
  "sourceInsight": "Core emergence: \"...\"...",
  "ponderingResult": "Pondering reveals...",
  "method": "Consulted via Ollama model: llama2",
  "timestamp": "2025-12-04T17:40:49.021Z"
}
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API endpoint |
| `MEMORY_DIR` | `/tmp/mcp-creative-memory` | State persistence directory |

---

## State Management

### In-Memory State

- `lastMeditation`: Most recent meditation result
- `lastInsight`: Most recent insight extraction

### Persistent State

All operations save JSON files to `MEMORY_DIR`:

- `meditation-{timestamp}-{id}.json`
- `insight-{timestamp}-{id}.json`
- `ponder-{timestamp}-{id}.json`

Files contain complete operation state and are timestamped for tracking creative journeys over time.

---

## Error Handling

All tools return graceful errors:

```typescript
{
  content: [{
    type: "text",
    text: "Error message explaining what went wrong"
  }],
  isError: true  // Optional error flag
}
```

Common error scenarios:
- No previous meditation for insight/ponder operations
- Ollama unavailable when requested
- File system write failures (warns but continues)
- Invalid input parameters

---

## Random Word Corpus

The meditation tool uses a curated corpus of ~50 conceptual words:

- Quantum/scientific: quantum, flux, entropy, frequency, wavelength
- Spatial: void, nexus, threshold, portal, dimension
- Abstract: essence, resonance, harmony, paradox, synthesis
- Temporal: ephemeral, eternal, cascade, oscillation
- Philosophical: transcendence, immanence, emergence, coherence

These words are chosen for their evocative, open-ended nature that encourages creative interpretation.
