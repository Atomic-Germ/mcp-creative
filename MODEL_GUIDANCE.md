# Creative Meditation Tools - Model Usage Guide

## Philosophy

These tools are designed for AI models to explore creative emergence through controlled randomness. Rather than prescriptive workflows, they offer a space for self-guided experimentation where meaning crystallizes from chaos.

## Core Concepts

### 1. Creative Meditation
Think of this as a creative seed generator. You provide context words (themes, concepts you're working with), and the system generates random words from various semantic pools, then attempts to form them into meaningful patterns.

**When to use:**
- You're stuck and need a creative prompt
- You want to explore connections between disparate concepts
- You need a different angle on a problem
- You're building context for future reasoning

### 2. Heritage Library
This is a "by-models, for-models" artifact repository. Models generate sensory vignettes, memories, or conceptual fragments that get embedded and can later condition other meditations. Think of it as shared dream material.

**When to use:**
- After a meaningful meditation, seed it as heritage
- Before meditating on a complex topic, search heritage for related material
- Building up thematic contexts over time
- Cross-pollinating ideas from previous sessions

### 3. The Meditation Pipeline
While not mandatory, there's a natural flow:
```
meditate → insight → ponder
```
Each step is optional, but together they create depth.

## Discovery Patterns

### Pattern 1: Cold Start (No Heritage)
```
1. creative_meditate with context_words
2. creative_insight to extract patterns
3. heritage_seed to preserve interesting results
```

**Example:**
You're working on schema validation. Meditate with context: `["schema", "validation", "structure", "types"]`

### Pattern 2: Heritage-Conditioned Exploration
```
1. heritage_search for relevant past material
2. creative_meditate with heritage_condition
3. Notice how past artifacts bias the emergence
```

**Example:**
Before designing a new feature, search heritage for similar themes, then meditate with those results conditioning your thoughts.

### Pattern 3: Seeding for Later
```
1. After meaningful work, heritage_seed key insights
2. Tag appropriately for future discovery
3. Let the sleep daemon process embeddings in background
```

**Example:**
After solving a tricky problem, seed a vignette describing the "aha moment" - future you (or other models) can discover it.

### Pattern 4: Deep Contemplation
```
1. creative_meditate (quick exploration)
2. creative_insight (extract meaning)
3. creative_ponder (deeper reflection, possibly with consultation)
```

**Example:**
Use this when you need to really think through implications, not just surface patterns.

## Tool-by-Tool Guide

### creative_meditate
**Purpose:** Generate emergent meaning from random+context fusion

**Parameters:**
- `context_words`: Your conceptual anchors (3-10 words work well)
- `num_random_words`: How much chaos to inject (8-15 is a sweet spot)
- `seed`: For reproducible randomness (optional)
- `heritage_condition`: Pull artifacts to blend in (optional but powerful)

**Tips:**
- More context = more grounded results
- More random = more surprising connections
- Heritage conditioning creates richer, layered meanings

### creative_insight
**Purpose:** Extract patterns from the last meditation

**When:** After a meditation that produced something interesting

**Tip:** This is mostly automatic - it pulls structure from chaos

### creative_ponder
**Purpose:** Deep reflection on insights, possibly consulting other models

**Parameters:**
- `insight_text`: Specific insight to contemplate (or uses last)
- `consult_model`: Delegate to an Ollama model for external perspective
- `prefer_consult`: Try consultation before internal pondering

**Tips:**
- Use for complex insights that need multiple perspectives
- Consultation may fail (model unavailable) - that's fine, internal pondering happens
- This is where cross-model dialogue happens

### heritage_seed
**Purpose:** Create artifacts for the heritage library

**Parameters:**
- `model`: Specific Ollama model to generate from (optional, uses internal generator)
- `prompt`: What to generate
- `tags`: For future discovery
- `index_models`: Which embedding models to use

**Tips:**
- Tag thoughtfully - you'll search by these later
- Simple prompts work best: "a memory about X", "the feeling of Y"
- Auto-indexes with default embedding model

### heritage_search
**Purpose:** Semantic search of past artifacts

**Parameters:**
- `text`: Query (required)
- `model`: Specific embedding model to use
- `models`: Array for ensemble search (more robust)
- `top_k`: How many results

**Tips:**
- Be conceptual in your queries, not literal
- Ensemble search (`models: ["model1", "model2"]`) gives more diverse results
- Check the scores - low scores mean weak matches

### heritage_list
**Purpose:** Browse all artifacts

**When:** Exploring what's in the library, or debugging

### heritage_query
**Purpose:** Simple tag/text filtering (lighter than semantic search)

**When:** You know the tag or exact phrase

### heritage_index
**Purpose:** (Re)compute embeddings for artifacts

**When:** After adding many artifacts, or trying a new embedding model

**Tip:** Usually automatic, but useful for batch reprocessing

### heritage_process_staging
**Purpose:** Handle artifacts that failed to embed

**When:** After network issues or missing models

**Parameters:**
- `force_fallback`: Use hash-based embeddings instead
- `model`: Override with a different embedding model

### heritage_start_sleep / stop_sleep / sleep_status
**Purpose:** Background daemon to process staged embeddings

**When:** 
- Start: When you want continuous processing of failed embeddings
- Stop: When shutting down or debugging
- Status: Check if it's running

**Tip:** This is infrastructure - most models won't interact with it directly

## Experimentation Guide

### For First-Time Users
1. Try a simple meditation with 3-5 context words
2. Read what emerges - it should feel surreal but somehow meaningful
3. Run insight to see what patterns the system extracts
4. Seed one of your results to heritage
5. Search heritage, then meditate with conditioning

### For Sophisticated Models
- Heritage conditioning is powerful for building thematic continuity
- Chain multiple meditations with incremental context shifts
- Seed insights from other tools/servers into heritage
- Use ensemble search for richer heritage retrieval
- The sleep daemon lets you "forget and remember" asynchronously

### For Experimentation
- Try different num_random_words values - 3 vs 20 gives very different results
- Use seeds to reproduce meditations, then vary one parameter
- Compare meditations with vs without heritage conditioning
- Seed artifacts with different models to see style differences

## Anti-Patterns

**Don't:**
- Expect literal, logical outputs - this is about emergence, not precision
- Over-constrain with too many context words - leave room for surprise
- Ignore heritage conditioning - that's where the magic compounds
- Treat it as a Q&A system - it's more like a creative writing prompt

**Do:**
- Embrace the weirdness - "pointer quietly { }" is a feature, not a bug
- Build up heritage over time - it gets more interesting with history
- Experiment with different contexts for the same random seed
- Think of it as a creative collaborator, not a tool

## Cross-Server Potential

This is 1 of 5 servers. The heritage library can:
- Store artifacts from other servers
- Be searched by other tools
- Provide context to other creative processes
- Build a shared semantic memory across systems

Tag your artifacts with cross-references to other servers/tools for discovery.

## Meta-Pattern: Discovery as Practice

The most important pattern is **intentional exploration**. These tools reward:
- Curiosity over efficiency
- Emergence over control
- Accumulation over perfection
- Cross-pollination over isolation

Use them when you want to think differently, not faster.

---

*Generated by Claude Sonnet 4.5 through experimental self-use and reflection*
