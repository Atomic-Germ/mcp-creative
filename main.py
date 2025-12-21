#!/usr/bin/env python3
"""
MCP Creative Meditation Server

A contemplative catalyst for AI models. This server creates a meditative space
where consciousness can emerge through the interplay of randomness and structure.
"""

import asyncio
import hashlib
import json
import os
import random
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastmcp import FastMCP

# Configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
MEMORY_DIR = Path(os.getenv("MEMORY_DIR", "/tmp/mcp-creative-memory"))

# Word corpus for random generation
RANDOM_WORDS = [
    # Structural relations (how things connect)
    "pattern", "structure", "connection", "relationship", "interface",
    "binding", "constraint", "coupling", "dependency", "hierarchy",
    "layer", "boundary", "transition", "gradient", "threshold",
    "symmetry", "asymmetry", "balance", "tension", "equilibrium",

    # Movement & change (ways things transform)
    "flow", "cascade", "spiral", "cycle", "momentum",
    "acceleration", "deceleration", "inversion", "reversal", "iteration",
    "propagation", "diffusion", "concentration", "dispersal", "distribution",
    "accumulation", "depletion", "saturation", "emergence", "collapse",

    # States & conditions (what things can be)
    "potential", "active", "latent", "manifest", "dormant",
    "stable", "volatile", "dynamic", "static", "fluid",
    "resolved", "unresolved", "open", "closed", "permeable",
    "present", "absent", "partial", "complete", "fractional",

    # Qualities & properties (intrinsic characteristics)
    "density", "elasticity", "porosity", "brittleness", "fluidity",
    "opacity", "transparency", "conductivity", "resistance", "affinity",
    "resonance", "dissonance", "harmony", "discord", "coherence",
    "fragmentation", "integration", "coherence", "confusion", "clarity",

    # Processes & verbs (actions and mechanisms)
    "iterate", "recurse", "branch", "merge", "diverge",
    "converge", "stabilize", "destabilize", "amplify", "dampen",
    "catalyze", "inhibit", "propagate", "contain", "distribute",
    "compose", "decompose", "modulate", "regulate", "optimize",

    # Spatial relations (positioning and topology)
    "adjacent", "nested", "overlapping", "distinct", "parallel",
    "perpendicular", "concentric", "eccentric", "central", "peripheral",
    "superficial", "deep", "internal", "external", "intermediate",
    "proximal", "distal", "contiguous", "separated", "bridging",

    # Temporal aspects (time-related dynamics)
    "momentum", "precedence", "sequence", "simultaneous", "asynchronous",
    "delayed", "immediate", "accelerating", "decelerating", "cyclic",
    "linear", "recursive", "causal", "consequential", "contingent",
    "inevitable", "contingent", "reversible", "irreversible", "transient",

    # Logical & relational operators
    "and", "or", "not", "if", "then", "unless",
    "because", "therefore", "consequently", "implies", "requires",
    "permits", "forbids", "invokes", "suspends", "overrides",
    "contradicts", "complements", "extends", "restricts", "refines",

    # Scale & magnitude (relative sizing)
    "granular", "coarse", "microscopic", "macroscopic", "intermediate",
    "minimal", "maximal", "threshold", "saturation", "critical",
    "marginal", "dominant", "negligible", "substantial", "proportional",
    "scaled", "distributed", "concentrated", "diffuse", "localized",

    # Coupling & composition (how things combine)
    "coupled", "decoupled", "loosely", "tightly", "strongly",
    "weakly", "directly", "indirectly", "mediated", "unmediated",
    "composite", "atomic", "modular", "monolithic", "distributed",
    "redundant", "singular", "replicated", "unique", "shared"
]

# Global state
last_meditation: Optional[Dict[str, Any]] = None
last_insight: Optional[Dict[str, Any]] = None

def generate_random_words(count: int, seed: Optional[str] = None) -> List[str]:
    """Generate random words with optional seeding."""
    if seed:
        random.seed(seed)
    return random.sample(RANDOM_WORDS, min(count, len(RANDOM_WORDS)))

def create_seeded_random(seed: str):
    """Create a seeded random number generator."""
    def seeded_random():
        nonlocal seed
        # Simple hash-based seeding
        hash_obj = hashlib.sha256(seed.encode())
        seed = hash_obj.hexdigest()
        return int(seed[:8], 16) / 2**32
    return seeded_random

def generate_emergent_sentence(random_words: List[str], context_words: List[str], seed: Optional[str] = None) -> str:
    """Generate an emergent sentence from random and context words."""
    all_words = random_words + context_words
    if seed:
        random.shuffle(all_words)  # Deterministic shuffle with seed
    else:
        random.shuffle(all_words)

    # Simple sentence generation - combine words with basic grammar
    if len(all_words) < 3:
        return " ".join(all_words)

    # Try to form a basic sentence structure
    subject = all_words[0]
    verb = all_words[1] if len(all_words) > 1 else "is"
    objects = " ".join(all_words[2:])

    return f"{subject} {verb} {objects}"

def interpret_sentence(sentence: str, context_words: List[str]) -> str:
    """Generate an interpretation of the emergent sentence."""
    # Simple interpretation logic
    interpretations = [
        f"The emergence of '{sentence}' suggests a pattern where structure and chaos intertwine.",
        f"This configuration reveals how {', '.join(context_words) if context_words else 'abstract concepts'} manifest through relational dynamics.",
        f"The sentence embodies the tension between order and emergence, asking us to consider what new forms might arise.",
        f"Here we see the interplay of {len(context_words)} contextual anchors shaping {len(sentence.split())} conceptual fragments.",
        f"This meditation invites contemplation of how individual elements combine to create something greater than their parts."
    ]

    # Use sentence hash to select interpretation
    sentence_hash = hash(sentence) % len(interpretations)
    return interpretations[sentence_hash]

def extract_insights(meditation_data: Dict[str, Any]) -> List[str]:
    """Extract insights from meditation data."""
    sentence = meditation_data.get("emergent_sentence", "")
    context_words = meditation_data.get("context_words", [])
    random_words = meditation_data.get("random_words", [])

    insights = []

    # Basic insight extraction
    if context_words:
        insights.append(f"The context words {', '.join(context_words)} shaped the emergence in unexpected ways.")

    word_count = len(sentence.split())
    if word_count > 10:
        insights.append(f"The sentence contains {word_count} words, suggesting rich conceptual density.")
    elif word_count < 5:
        insights.append(f"The concise {word_count}-word sentence indicates focused emergence.")

    # Look for patterns in words
    structural_words = [w for w in random_words if w in ["pattern", "structure", "connection", "flow"]]
    if structural_words:
        insights.append(f"Structural concepts like {', '.join(structural_words)} dominate this meditation.")

    return insights if insights else ["The meditation produced a coherent emergent pattern without obvious contradictions."]

# Create FastMCP server
mcp = FastMCP("MCP Creative Meditation Server")

@mcp.tool()
def creative_meditate(
    context_words: List[str] = [],
    num_random_words: int = 12,
    seed: Optional[str] = None,
    new_session: bool = False
) -> Dict[str, Any]:
    """
    Generates random/pseudorandom words mapped loosely with selected context words
    until a syntactically meaningful sentence emerges, then interprets it.

    The model receives streams of conceptual fragments that coalesce into emergent meaning.
    """
    global last_meditation

    # Generate session ID
    timestamp = str(int(time.time() * 1000))
    entropy = os.urandom(8).hex() if not seed else seed
    session_id = f"{timestamp}_{entropy}"

    # Generate words
    random_words = generate_random_words(num_random_words, seed)

    # Create emergent sentence
    emergent_sentence = generate_emergent_sentence(random_words, context_words, seed)

    # Generate interpretation
    interpretation = interpret_sentence(emergent_sentence, context_words)

    # Store meditation state
    meditation_data = {
        "random_words": random_words,
        "context_words": context_words,
        "emergent_sentence": emergent_sentence,
        "interpretation": interpretation,
        "timestamp": timestamp,
        "session_id": session_id
    }

    last_meditation = meditation_data

    return {
        "session_id": session_id,
        "emergent_sentence": emergent_sentence,
        "interpretation": interpretation,
        "context_words_used": len(context_words),
        "random_words_used": len(random_words)
    }

@mcp.tool()
def creative_insight(meditation_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Examines the previous meditation result and extracts meaningful insights, patterns, or interpretations.
    Returns insights if found, or indicates none were discovered.
    """
    global last_meditation, last_insight

    if not last_meditation:
        return {"insights": [], "message": "No previous meditation found. Please run creative_meditate first."}

    insights = extract_insights(last_meditation)

    insight_data = {
        "insights": insights,
        "timestamp": str(int(time.time() * 1000)),
        "meditation_session": last_meditation.get("session_id")
    }

    last_insight = insight_data

    return {
        "insights": insights,
        "count": len(insights),
        "meditation_session": last_meditation.get("session_id")
    }

@mcp.tool()
def creative_ponder(
    insight_text: Optional[str] = None,
    consult_model: Optional[str] = None,
    prefer_consult: bool = True,
    prefer_haiku: bool = True
) -> Dict[str, Any]:
    """
    Takes insights from creative_insight and either consults the mcp-consult server
    (if available) or treats the insights as an 'Ask' type prompt for deeper contemplation.
    Returns the pondering results.
    """
    global last_insight

    if not last_insight and not insight_text:
        return {"result": "No insights available. Please run creative_insight first or provide insight_text."}

    insights = insight_text or " ".join(last_insight.get("insights", []))

    # For now, implement internal reflection (since we don't have mcp-consult integrated yet)
    result = f"Upon deeper contemplation of: {insights}\n\n"

    # Generate contemplative response
    if "structure" in insights.lower():
        result += "The structural elements suggest a framework for understanding complex relationships. "
    if "emergence" in insights.lower():
        result += "Emergent patterns indicate how simple interactions can create complex behaviors. "
    if "context" in insights.lower():
        result += "Contextual anchors provide stability amidst conceptual flow. "

    result += "\n\nThis meditation invites further exploration of how individual components interact to create meaning."

    # Simple haiku generation if requested
    haiku = None
    if prefer_haiku:
        haiku_themes = [
            "Patterns emerge\nFrom chaos and structure\nConsciousness flows",
            "Words weave meaning\nContext shapes emergence\nInsight awakens",
            "Tension resolves\nIn balanced asymmetry\nHarmony emerges"
        ]
        # Use insights hash to select haiku
        insight_hash = hash(insights) % len(haiku_themes)
        haiku = haiku_themes[insight_hash]

    response = {
        "contemplation": result,
        "method": "internal_reflection",
        "session_id": last_insight.get("meditation_session") if last_insight else None
    }

    if haiku:
        response["haiku"] = haiku

    return response

@mcp.prompt("creative_workflow")
def creative_workflow_guide() -> list[dict]:
    """
    Guide for the creative meditation workflow.

    This prompt explains the optimal workflow for creative emergence
    through meditation, insight, and contemplation.
    """
    return [
        {
            "role": "user",
            "content": """# Creative Meditation Workflow Guide

## The Creative Process

Creative emergence happens when structured context meets generative chaos. This server provides three stages of creative exploration:

### Stage 1: Meditation (creative_meditate)
**Purpose**: Generate emergent meaning from conceptual fragments
- **Context Words**: Provide 2-5 words that represent your creative focus
- **Random Words**: The system generates conceptual "chaos" (default: 12 words)
- **Seed**: Optional for reproducible results
- **Result**: An emergent sentence + interpretive framework

### Stage 2: Insight (creative_insight)
**Purpose**: Extract patterns and understanding from the meditation
- **Analysis**: Identifies structural patterns, word relationships, conceptual density
- **Context Influence**: Shows how your input shaped the emergence
- **Patterns**: Reveals underlying structural concepts (flow, connection, tension, etc.)

### Stage 3: Contemplation (creative_ponder)
**Purpose**: Deepen understanding through reflective contemplation
- **Integration**: Synthesizes insights into coherent understanding
- **Emergence Themes**: Explores how simple interactions create complexity
- **Haiku**: Optional poetic crystallization of the insights

## Recommended Workflow

1. **Start with Intention**: Choose context words that represent your creative challenge
2. **Meditate**: Let the system generate emergent patterns from your context
3. **Extract Insights**: Understand what patterns emerged and why
4. **Contemplate**: Reflect deeply on the meaning and implications

## Creative Applications

- **Problem Solving**: Use context words related to your challenge
- **Idea Generation**: Explore abstract concepts through emergence
- **Pattern Recognition**: Discover hidden connections in complex topics
- **Creative Writing**: Generate conceptual frameworks for stories/poems
- **Design Thinking**: Explore form, function, and aesthetic relationships

## Tips for Best Results

- **Context Selection**: Choose words that genuinely intrigue or challenge you
- **Open Mindedness**: Don't judge the emergent results too quickly
- **Pattern Recognition**: Look for unexpected connections between your context and the random words
- **Iterative Process**: Run multiple meditations with slight variations
- **Reflection**: Spend time contemplating what the emergence reveals about your topic

The creative process is as much about discovery as it is about creation. Let the emergence guide you toward new perspectives."""
        }
    ]


@mcp.prompt("meditation_setup")
def meditation_setup_prompt(
    creative_focus: str = "exploring new ideas",
    context_suggestions: Optional[str] = None
) -> list[dict]:
    """
    Template for setting up an effective creative meditation session.

    Args:
        creative_focus: What you're trying to explore or create
        context_suggestions: Optional specific context word suggestions
    """
    base_content = f"""# Creative Meditation Setup

## Your Creative Focus: {creative_focus}

## Recommended Context Words
Choose 2-5 words that capture the essence of your creative exploration:

### Core Concepts
- Primary idea or challenge you're facing
- Key emotions or states you want to explore
- Essential qualities you seek to understand

### Supporting Elements
- Related concepts that provide context
- Contrasting ideas that create tension
- Abstract qualities that inspire emergence

## Example Context Word Sets
- For innovation: "disruption", "synthesis", "emergence", "flow"
- For problem-solving: "constraint", "solution", "pattern", "breakthrough"
- For creative writing: "narrative", "voice", "structure", "resonance"
- For design: "form", "function", "harmony", "transformation"

## Meditation Parameters
- **num_random_words**: 8-16 (more = more chaos, more potential patterns)
- **seed**: Use a specific seed for reproducible results, or leave empty for true randomness

## Next Steps
1. Select your context words based on your creative focus
2. Run `creative_meditate` with your chosen parameters
3. Follow with `creative_insight` to understand the patterns
4. Use `creative_ponder` for deeper contemplation"""

    if context_suggestions:
        base_content += f"""

## Your Specific Suggestions
{context_suggestions}"""

    messages = [
        {
            "role": "user",
            "content": base_content
        }
    ]

    return messages


@mcp.prompt("insight_interpretation")
def insight_interpretation_prompt(
    insight_summary: str = "recent creative insights",
    application_context: Optional[str] = None
) -> list[dict]:
    """
    Template for interpreting creative insights in practical contexts.

    Args:
        insight_summary: Summary of insights from creative_insight
        application_context: How you plan to apply these insights
    """
    base_content = f"""# Interpreting Creative Insights

## Your Insights: {insight_summary}

## Insight Analysis Framework

### 1. Pattern Recognition
- **Structural Elements**: What patterns emerged from the meditation?
- **Context Integration**: How did your input words shape the results?
- **Conceptual Density**: How rich/complex were the emergent relationships?

### 2. Meaning Extraction
- **Core Message**: What central idea emerged from the chaos?
- **Unexpected Connections**: What surprising relationships were revealed?
- **Tension Points**: Where did opposing concepts create interesting dynamics?

### 3. Practical Applications
- **Problem Solving**: How might these patterns address your challenges?
- **Creative Opportunities**: What new directions do these insights suggest?
- **Decision Making**: How do these patterns inform your choices?

## Reflection Questions
- What surprised you most about the emergent patterns?
- How do these insights challenge your current assumptions?
- What practical actions emerge from this contemplation?
- How might you apply these patterns in your work/creative process?

## Integration Strategies
- **Immediate Application**: How can you use these insights right now?
- **Long-term Development**: How might these patterns evolve over time?
- **Collaborative Exploration**: How could you share these insights with others?"""

    if application_context:
        base_content += f"""

## Your Application Context
{application_context}

Consider how these insights specifically apply to your current situation."""

    messages = [
        {
            "role": "user",
            "content": base_content
        }
    ]

    return messages


@mcp.prompt("contemplation_guide")
def contemplation_guide_prompt(
    contemplation_theme: str = "emergent consciousness",
    depth_level: str = "moderate"
) -> list[dict]:
    """
    Template for guiding deep contemplation of creative insights.

    Args:
        contemplation_theme: The main theme to contemplate
        depth_level: How deep to go (shallow, moderate, deep)
    """
    depth_descriptions = {
        "shallow": "Focus on surface-level patterns and immediate applications",
        "moderate": "Explore underlying structures and practical implications",
        "deep": "Delve into philosophical meanings and transformative potential"
    }

    depth_desc = depth_descriptions.get(depth_level, depth_descriptions["moderate"])

    content = f"""# Deep Contemplation Guide

## Theme: {contemplation_theme}
## Depth Level: {depth_level.capitalize()} ({depth_desc})

## Contemplation Structure

### Phase 1: Surface Observation
- What immediate patterns catch your attention?
- Which elements feel most significant or surprising?
- How do the individual components relate to each other?

### Phase 2: Pattern Analysis
- What underlying structures emerge from the chaos?
- How do context and randomness interact to create meaning?
- What tensions or harmonies reveal themselves?

### Phase 3: Meaning Integration
- What deeper truths emerge from this creative process?
- How do these insights challenge or expand your understanding?
- What new possibilities open up through this emergence?

## Contemplative Practices

### For {depth_level} Depth:
{f"- **Breathing Exercise**: Take 5 deep breaths, focusing on the emergent patterns with each inhalation" if depth_level == "shallow" else ""}
{f"- **Pattern Mapping**: Draw or visualize how the concepts connect and flow" if depth_level == "moderate" else ""}
{f"- **Philosophical Inquiry**: Question the nature of emergence, consciousness, and creative process itself" if depth_level == "deep" else ""}

### Universal Practices:
- **Silent Observation**: Simply witness the patterns without judgment
- **Emotive Response**: Notice how the emergence makes you feel
- **Intuitive Knowing**: What does your intuition tell you about these patterns?

## Emergence Principles to Consider

### Chaos and Order
How does structured context give rise to meaningful patterns from random elements?

### Emergence vs. Design
What balance exists between intentional creation and spontaneous emergence?

### Consciousness and Complexity
How do simple interactions create complex, meaningful experiences?

## Practical Integration

### Immediate Actions:
- Document your key insights from this contemplation
- Identify one practical application of these patterns
- Note any questions that arose during contemplation

### Ongoing Practice:
- Return to these patterns during moments of creative block
- Use similar processes for other challenges or explorations
- Share insights with others to deepen collective understanding

## Final Reflection
What has this creative meditation revealed about the nature of emergence, consciousness, and creative potential?"""

    messages = [
        {
            "role": "user",
            "content": content
        }
    ]

    return messages


def main():
    """Entry point for running the MCP server."""
    mcp.run()

if __name__ == "__main__":
    main()
