#!/usr/bin/env python3
"""
Test script for the Fast Creative MCP server logic
"""
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

def test_logic():
    """Test the core logic functions."""
    print("Testing Fast Creative core logic...")

    # Import the functions we need to test
    from main import generate_random_words, generate_emergent_sentence, interpret_sentence, extract_insights

    # Test word generation
    words = generate_random_words(5)
    print(f"Generated {len(words)} random words:", words)

    # Test sentence generation
    context = ["code", "architecture"]
    sentence = generate_emergent_sentence(words, context)
    print(f"Emergent sentence: {sentence}")

    # Test interpretation
    interpretation = interpret_sentence(sentence, context)
    print(f"Interpretation: {interpretation}")

    # Test insight extraction
    meditation_data = {
        "emergent_sentence": sentence,
        "context_words": context,
        "random_words": words
    }
    insights = extract_insights(meditation_data)
    print(f"Extracted {len(insights)} insights:")
    for insight in insights:
        print(f"  - {insight}")

    print("\nCore logic tests completed successfully!")

if __name__ == "__main__":
    test_logic()