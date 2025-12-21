#!/usr/bin/env python3
"""
Test script for fast-creative server.
"""

import asyncio
from main import mcp

async def test_components():
    """Test the available tools and prompts."""
    print("🔍 Checking fast-creative server components...")

    # Get tools
    tools = await mcp.get_tools()
    print(f"✅ Found {len(tools)} tools:")
    for tool in tools:
        print(f"   - {tool}")

    # Get prompts
    prompts = await mcp.get_prompts()
    print(f"✅ Found {len(prompts)} prompts:")
    for prompt in prompts:
        print(f"   - {prompt}")

if __name__ == "__main__":
    asyncio.run(test_components())