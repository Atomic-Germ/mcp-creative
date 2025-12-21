#!/usr/bin/env python3
"""
Test the creative tools to understand their workflow.
"""

import asyncio
from main import creative_meditate, creative_insight, creative_ponder

async def test_workflow():
    """Test the complete creative workflow."""
    print("🧘 Testing Creative Workflow")
    print("=" * 40)

    # Step 1: Meditate
    print("\n1. 🧘‍♀️ Creative Meditation")
    meditation_result = creative_meditate.fn(
        context_words=["creativity", "emergence", "consciousness"],
        num_random_words=8,
        seed="test_seed"
    )
    print("Meditation result:")
    print(f"   Session ID: {meditation_result['session_id']}")
    print(f"   Emergent sentence: {meditation_result['emergent_sentence']}")
    print(f"   Interpretation: {meditation_result['interpretation']}")

    # Step 2: Extract insights
    print("\n2. 🔍 Creative Insight")
    insight_result = creative_insight.fn()
    print("Insight result:")
    print(f"   Found {insight_result['count']} insights:")
    for i, insight in enumerate(insight_result['insights'], 1):
        print(f"   {i}. {insight}")

    # Step 3: Ponder deeper
    print("\n3. 🤔 Creative Ponder")
    ponder_result = creative_ponder.fn()
    print("Ponder result:")
    print(f"   Method: {ponder_result['method']}")
    print(f"   Contemplation: {ponder_result['contemplation']}")
    if 'haiku' in ponder_result:
        print(f"   Haiku: {ponder_result['haiku']}")

    print("\n✅ Workflow test complete!")

if __name__ == "__main__":
    asyncio.run(test_workflow())