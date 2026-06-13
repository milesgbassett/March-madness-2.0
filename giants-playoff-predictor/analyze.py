"""Sends the combined research to Claude and returns a structured playoff estimate."""

import json
from datetime import date

import anthropic

MODEL = "claude-sonnet-4-6"

RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "playoff_probability": {
            "type": "number",
            "description": (
                "Estimated chance the New York Giants make the NFL playoffs "
                "this season, as a percentage from 0 to 100."
            ),
        },
        "reasoning": {
            "type": "array",
            "items": {"type": "string"},
            "description": "3-5 key factors driving the estimate, one short sentence each.",
        },
        "confidence": {
            "type": "string",
            "enum": ["low", "medium", "high"],
            "description": (
                "Confidence in the estimate given the quality and timeliness "
                "of the available data."
            ),
        },
    },
    "required": ["playoff_probability", "reasoning", "confidence"],
    "additionalProperties": False,
}

ANALYSIS_PROMPT = """\
Today is {today}. You are an NFL analyst estimating the New York Giants'
chance of making the playoffs this season (if the league is currently in the
offseason, estimate for the upcoming season).

Base your estimate on the research below: weigh the current record and
remaining schedule against the NFC playoff picture, and factor in injuries,
roster moves, and performance trends. Give 3-5 key factors and rate your
confidence (low/medium/high) based on how complete and current the data is.

<team_stats>
{team_stats}
</team_stats>

<recent_news>
{news}
</recent_news>
"""


def analyze(team_stats: str, news: str) -> dict:
    """Return {"playoff_probability": float, "reasoning": [str], "confidence": str}."""
    client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment
    response = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        output_config={"format": {"type": "json_schema", "schema": RESPONSE_SCHEMA}},
        messages=[
            {
                "role": "user",
                "content": ANALYSIS_PROMPT.format(
                    today=date.today().strftime("%B %d, %Y"),
                    team_stats=team_stats,
                    news=news,
                ),
            }
        ],
    )
    return json.loads(response.content[0].text)
