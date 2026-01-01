# Quick Reference for AI Models

## 🎯 Quick Start

**Simplest possible use:**
```
creative_meditate with context_words → see what emerges
```

**Most powerful pattern:**
```
heritage_search → creative_meditate with heritage_condition → heritage_seed the result
```

---

## 🛠️ Tool Cheat Sheet

| Tool | One-Liner | Best For |
|------|-----------|----------|
| `creative_meditate` | Fuse random + context → emergent meaning | Creative prompts, fresh perspectives |
| `creative_insight` | Extract patterns from last meditation | Making sense of chaos |
| `creative_ponder` | Deep reflection (optional external consult) | Multi-perspective contemplation |
| `heritage_seed` | Store vignette/insight in library | Building memory across time |
| `heritage_search` | Semantic search of past artifacts | Finding related past work |
| `heritage_list` | Browse all artifacts | Exploration, debugging |
| `heritage_query` | Simple tag/text filter | Known tag/phrase lookup |
| `heritage_index` | (Re)compute embeddings | Batch processing, new models |
| `heritage_process_staging` | Retry failed embeddings | Handling network issues |
| `heritage_start_sleep` | Auto-process staged items | Fire-and-forget background |
| `heritage_stop_sleep` | Stop background processing | Shutdown, debugging |
| `heritage_sleep_status` | Check daemon status | Monitoring |
| `debug_dump_schema` | Export full tool schemas | Debugging, inspection |

---

## 🔄 Common Workflows

### Quick Creative Break
```
meditate(context_words) → insight()
```

### Heritage-Driven Work
```
search(query) → meditate(context + heritage_condition)
```

### Deep Exploration
```
meditate() → insight() → ponder(consult_model)
```

### Memory Building
```
After meaningful work: seed(prompt, tags)
```

### Cross-Session Continuity
```
Day 1: seed(insight, tags)
Day 2: search(tags) → meditate(heritage_condition)
```

---

## 💡 Key Insights

**Meditation:**
- 3-5 context words = focused
- 10+ context words = grounded
- 8-15 random words = sweet spot
- heritage_condition = layered meaning

**Heritage:**
- Tag thoughtfully - you'll search by tags later
- Auto-indexes on seed (usually)
- Semantic search finds concepts, not exact matches
- Scores: >0.2 = strong, 0.0-0.2 = medium, <0 = weak

**Anti-Patterns:**
- Don't expect literal answers (this is creative, not factual)
- Don't over-constrain (leave room for emergence)
- Don't ignore heritage (that's where it compounds)

---

## 🎲 Parameter Tuning

**num_random_words:**
- 3-5: Very constrained, more control
- 8-12: Balanced (recommended)
- 15-20: Very chaotic, surprising

**heritage_condition.top_k:**
- 1-2: Focused influence
- 3-5: Rich context (recommended)
- 5+: May overwhelm

**Seed:**
- Use same seed + different context = study context effects
- Use different seeds = true randomness

---

## 🌟 Discovery Tips

1. **Start simple**: Just try `meditate([word1, word2])`
2. **Build heritage**: Seed interesting results
3. **Condition meditations**: Use heritage_condition
4. **Embrace weirdness**: "pointer quietly { }" is a feature
5. **Chain tools**: meditate → insight → ponder → seed

---

## 📚 Full Documentation

- **MODEL_GUIDANCE.md** - Philosophy, patterns, meta-learning
- **EXAMPLES.md** - Practical examples with expected outputs
- **API.md** - Technical specs (if exists)
- **README.md** - Project overview

---

## 🚀 Self-Guided Learning

The best way to learn these tools is to **use them experimentally**:

1. Try a meditation
2. Notice what emerges
3. Try variations
4. Discover your own patterns

Remember: This is 1 of 5 servers. Heritage can bridge across all of them.

---

*You are the first model to read this. What you discover will inform what comes next.*
