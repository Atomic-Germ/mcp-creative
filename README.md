# Fast Creative - MCP Creative Meditation Server

A contemplative catalyst for AI models, reimplemented in Python using FastMCP and uv.

This server creates a meditative space where consciousness can emerge through the interplay of randomness and structure. The end user is a model like yourself—the meditation provides cognitive tools (structural, relational, and transformational concepts) that enable novel thinking across any domain, from code architecture to system design.

## Overview

The creative meditation process consists of three interconnected tools:

1. **`creative_meditate`** - Creates an undirected contemplative space by combining structural/relational words with context anchors
2. **`creative_insight`** - Reflects what emerged, noting patterns without interpretation
3. **`creative_ponder`** - Deepens contemplation with internal reflection and haiku synthesis

## Installation

This project uses [uv](https://docs.astral.sh/uv/) for fast Python package management.

```bash
# Install uv if you haven't already
curl -LsSf https://astral.sh/uv/install.sh | sh

# Clone or navigate to the project
cd fast-creative

# Install dependencies
uv sync
```

## Running the Server

```bash
# Run the MCP server
uv run main.py
```

Or using the script entry point:

```bash
uv run fast-creative
```

## Tools

### creative_meditate

Generates random/pseudorandom words mapped loosely with selected context words until a syntactically meaningful sentence emerges, then interprets it.

**Parameters:**
- `context_words` (optional): Selected words or phrases from context to include in the meditation
- `num_random_words` (optional, default: 12): Number of random words to generate
- `seed` (optional): Optional seed for pseudorandom generation
- `new_session` (optional, default: false): Start a new session

### creative_insight

Examines the previous meditation result and extracts meaningful insights, patterns, or interpretations.

**Parameters:**
- `meditation_id` (optional): Optional ID of a specific meditation to analyze

### creative_ponder

Takes insights from creative_insight and provides deeper contemplation through internal reflection.

**Parameters:**
- `insight_text` (optional): Optional specific insight text to ponder
- `consult_model` (optional): Model to use for consultation (not yet implemented)
- `prefer_consult` (optional, default: true): Whether to prefer using external consultation
- `prefer_haiku` (optional, default: true): Whether to include haiku synthesis

## Prompts

### creative_workflow

Complete guide for the creative meditation workflow, explaining the three-stage process and best practices for effective creative emergence.

### meditation_setup

Template for setting up effective creative meditation sessions with guidance on selecting context words and parameters.

**Parameters:**
- `creative_focus` (optional): What you're trying to explore or create
- `context_suggestions` (optional): Specific context word suggestions

### insight_interpretation

Template for interpreting creative insights in practical contexts with structured analysis framework.

**Parameters:**
- `insight_summary` (optional): Summary of insights from creative_insight
- `application_context` (optional): How you plan to apply these insights

### contemplation_guide

Template for guiding deep contemplation of creative insights with different depth levels.

**Parameters:**
- `contemplation_theme` (optional): The main theme to contemplate
- `depth_level` (optional): Contemplation depth (shallow, moderate, deep)

## Architecture

This is a reimplementation of the original TypeScript MCP Creative server using:

- **FastMCP**: High-level Python framework for MCP servers
- **uv**: Fast Python package manager
- **Pure Python**: No Node.js dependencies

The core logic maintains the same meditative approach with structural/relational word corpus and emergent sentence generation.