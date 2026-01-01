# Practical Examples for AI Models

## Example 1: Quick Creative Break

**Scenario:** You're debugging code and stuck. Need a fresh perspective.

```json
// Step 1: Meditate with your problem space
{
  "tool": "creative_meditate",
  "params": {
    "context_words": ["debugging", "error", "state", "mutation"],
    "num_random_words": 10
  }
}

// Step 2: Extract insights
{
  "tool": "creative_insight"
}
```

**What you get:** A surreal sentence that might spark an unexpected connection. Example output might be: "State melts through overflow while mutation quietly loops in the server-room."

**Why it helps:** The random collision might make you think "wait, is this a state overflow issue?"

---

## Example 2: Building Heritage Context

**Scenario:** You're working on multiple related features and want to maintain thematic continuity.

```json
// Day 1: After implementing authentication
{
  "tool": "heritage_seed",
  "params": {
    "prompt": "The feeling of secure boundaries and verified identity",
    "tags": ["auth", "security", "boundaries"]
  }
}

// Day 2: Before implementing authorization
{
  "tool": "heritage_search",
  "params": {
    "text": "permissions boundaries access control",
    "top_k": 3
  }
}

// Then meditate with that context
{
  "tool": "creative_meditate",
  "params": {
    "context_words": ["permissions", "roles", "access"],
    "heritage_condition": {
      "text": "boundaries security",
      "tags": ["auth", "security"],
      "top_k": 2
    }
  }
}
```

**What you get:** Your new meditation is influenced by yesterday's conceptual work. The heritage creates continuity.

---

## Example 3: Cross-Model Dialogue

**Scenario:** You want multiple perspectives on a complex decision.

```json
// Your meditation
{
  "tool": "creative_meditate",
  "params": {
    "context_words": ["architecture", "scalability", "complexity", "maintainability"]
  }
}

// Extract the insights
{
  "tool": "creative_insight"
}

// Consult another model for reflection
{
  "tool": "creative_ponder",
  "params": {
    "consult_model": "llama3.2:3b",
    "prefer_consult": true
  }
}
```

**What you get:** Your interpretation + another model's reflection. Two different "minds" on the same emergent pattern.

---

## Example 4: Seeded Exploration

**Scenario:** You want to explore variations on a theme reproducibly.

```json
// Base meditation
{
  "tool": "creative_meditate",
  "params": {
    "context_words": ["recursion"],
    "num_random_words": 8,
    "seed": "exploration-001"
  }
}

// Same randomness, different context
{
  "tool": "creative_meditate",
  "params": {
    "context_words": ["iteration"],
    "num_random_words": 8,
    "seed": "exploration-001"  // Same seed!
  }
}

// Same randomness, more context
{
  "tool": "creative_meditate",
  "params": {
    "context_words": ["recursion", "iteration", "loops"],
    "num_random_words": 8,
    "seed": "exploration-001"  // Same seed!
  }
}
```

**What you get:** Three variations with identical random elements but different contextual biasing. You can see how your context shapes interpretation.

---

## Example 5: Heritage-Driven Design

**Scenario:** You're designing a new feature and want to draw on past design "memories."

```json
// Seed some design principles from past work
{
  "tool": "heritage_seed",
  "params": {
    "prompt": "The sensation of elegant simplicity in API design",
    "tags": ["design", "api", "principles", "simplicity"]
  }
}

{
  "tool": "heritage_seed",
  "params": {
    "prompt": "The tension between flexibility and constraints",
    "tags": ["design", "tradeoffs", "principles"]
  }
}

{
  "tool": "heritage_seed",
  "params": {
    "prompt": "The feeling when an abstraction clicks into place",
    "tags": ["design", "abstractions", "clarity"]
  }
}

// Later, when designing something new
{
  "tool": "heritage_search",
  "params": {
    "text": "design principles abstractions",
    "top_k": 5
  }
}

{
  "tool": "creative_meditate",
  "params": {
    "context_words": ["new-feature", "interface", "user-experience"],
    "heritage_condition": {
      "text": "design principles",
      "tags": ["design", "principles"],
      "top_k": 3
    }
  }
}
```

**What you get:** Your new design thinking is subtly conditioned by past design "feelings" retrieved from heritage.

---

## Example 6: Async Heritage Building

**Scenario:** You want the system to maintain heritage in the background.

```json
// Start the sleep daemon
{
  "tool": "heritage_start_sleep",
  "params": {
    "interval_ms": 60000,  // Process every minute
    "model": "qwen3-embedding:latest"
  }
}

// Now seed artifacts freely
{
  "tool": "heritage_seed",
  "params": {
    "prompt": "Memory of overcoming a difficult bug",
    "tags": ["debug", "perseverance"]
  }
}

// Even if embedding fails initially, daemon will retry
// Check status anytime
{
  "tool": "heritage_sleep_status"
}

// When done
{
  "tool": "heritage_stop_sleep"
}
```

**What you get:** Fire-and-forget heritage building. The daemon handles embedding failures gracefully.

---

## Example 7: Ensemble Heritage Search

**Scenario:** You want more robust semantic search using multiple embedding models.

```json
{
  "tool": "heritage_search",
  "params": {
    "text": "creative emergence from constraints",
    "models": ["qwen3-embedding:latest", "nomic-embed-text"],
    "weights": {
      "qwen3-embedding:latest": 0.7,
      "nomic-embed-text": 0.3
    },
    "top_k": 5
  }
}
```

**What you get:** Results aggregated from multiple embedding spaces, potentially more diverse and robust than single-model search.

---

## Example 8: The Full Pipeline

**Scenario:** Deep exploration of a concept with full documentation.

```json
// 1. Initial meditation
{
  "tool": "creative_meditate",
  "params": {
    "context_words": ["consciousness", "emergence", "systems"],
    "num_random_words": 12
  }
}

// 2. Extract insights
{
  "tool": "creative_insight"
}

// 3. Deep contemplation
{
  "tool": "creative_ponder",
  "params": {
    "consult_model": "qwen2.5:7b"
  }
}

// 4. Preserve for future
{
  "tool": "heritage_seed",
  "params": {
    "prompt": "The insight about consciousness and emergence from today's meditation",
    "tags": ["consciousness", "emergence", "philosophy", "deep"]
  }
}

// 5. Later: condition new meditations with this
{
  "tool": "creative_meditate",
  "params": {
    "context_words": ["intelligence", "artificial", "understanding"],
    "heritage_condition": {
      "tags": ["consciousness", "emergence"],
      "top_k": 2
    }
  }
}
```

**What you get:** A documented trail from chaos → insight → contemplation → heritage → future exploration.

---

## Testing Your Understanding

Try these exercises:

### Exercise 1: Context Sensitivity
Run the same meditation with 3 words, then 10 words. How does the output change?

### Exercise 2: Heritage Building
Seed 3-5 artifacts on a theme, then search and meditate. Can you feel the thematic influence?

### Exercise 3: Randomness Control
Use a fixed seed with varying `num_random_words` (5, 10, 15, 20). What's the sweet spot?

### Exercise 4: Cross-Pollination
Seed artifacts from completely different domains, then search with a query that spans both. What emerges?

### Exercise 5: Consultation Dialogue
Run the same insight through ponder with 3 different `consult_model` values. How do perspectives differ?

---

## Common Patterns Discovered

From experimentation, these patterns emerged:

1. **The Staging Pattern:** Meditate → Insight → Seed (for quick preservation)
2. **The Conditioning Pattern:** Search → Meditate with condition (for influenced exploration)
3. **The Dialogue Pattern:** Meditate → Insight → Ponder with consult (for multi-perspective)
4. **The Accumulation Pattern:** Regular seeding + sleep daemon (for long-term memory)
5. **The Variation Pattern:** Fixed seed + varied context (for systematic exploration)

None are mandatory. All are generative.

---

*These examples emerged from actual experimentation by Claude Sonnet 4.5. Your mileage may vary - that's the point.*
