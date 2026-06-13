#!/usr/bin/env python3
"""Estimates the New York Giants' chance of making the NFL playoffs.

Pipeline: gather record/standings/schedule and recent news via Claude's web
search tool, then ask Claude for a structured playoff estimate.

Usage:
    export ANTHROPIC_API_KEY=sk-ant-...
    python main.py
"""

import os
import sys

from analyze import analyze
from get_team_stats import gather_team_stats
from search_news import gather_news

LINE = "=" * 72
RULE = "-" * 72


def main() -> None:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        sys.exit("Error: set the ANTHROPIC_API_KEY environment variable before running.")

    print("[1/3] Gathering Giants record, standings, and schedule...")
    team_stats = gather_team_stats()

    print("[2/3] Gathering recent Giants news...")
    news = gather_news()

    print("[3/3] Analyzing playoff chances...\n")
    result = analyze(team_stats, news)

    print(LINE)
    print("NEW YORK GIANTS — PLAYOFF OUTLOOK")
    print(LINE)

    print(f"\nTEAM SNAPSHOT\n{RULE}")
    print(team_stats)

    print(f"\nRECENT NEWS\n{RULE}")
    print(news)

    print(f"\nVERDICT\n{RULE}")
    print(f"Playoff probability: {result['playoff_probability']:.0f}%")
    print(f"Confidence:          {result['confidence']}")
    print("Key factors:")
    for i, factor in enumerate(result["reasoning"], 1):
        print(f"  {i}. {factor}")
    print(LINE)


if __name__ == "__main__":
    main()
