"""Shared helper for Claude API calls that use the server-side web search tool."""

import anthropic

MODEL = "claude-sonnet-4-6"
MAX_CONTINUATIONS = 5


def run_web_research(prompt: str, max_tokens: int = 8000) -> str:
    """Run a web-search-enabled request and return the model's text output.

    Server-side tools run in a server-side sampling loop that can pause
    (stop_reason "pause_turn"); re-sending the conversation resumes it.
    """
    client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment
    tools = [{"type": "web_search_20260209", "name": "web_search"}]
    messages = [{"role": "user", "content": prompt}]

    response = client.messages.create(
        model=MODEL, max_tokens=max_tokens, tools=tools, messages=messages
    )
    for _ in range(MAX_CONTINUATIONS):
        if response.stop_reason != "pause_turn":
            break
        messages = messages + [{"role": "assistant", "content": response.content}]
        response = client.messages.create(
            model=MODEL, max_tokens=max_tokens, tools=tools, messages=messages
        )

    return "\n".join(
        block.text for block in response.content if block.type == "text"
    ).strip()
