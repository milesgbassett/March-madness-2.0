"""Gathers and summarizes recent New York Giants news via Claude web search."""

from datetime import date

from web_research import run_web_research

NEWS_PROMPT = """\
Today is {today}. Use web search to find New York Giants (NFL) news from the
last 1-2 weeks, then write a concise summary (under 300 words) covering:

- Injuries to key players and expected return timelines
- Roster moves: signings, releases, trades, draft picks, practice-squad changes
- Coaching or front-office changes
- Recent performance trends and anything else that could affect their playoff
  chances this season

Stick to facts found in the search results and note roughly when each item
happened. If the NFL is currently in its offseason, say so and summarize the
offseason moves that matter most for the upcoming season instead.
"""


def gather_news() -> str:
    """Return a summary of recent Giants news."""
    return run_web_research(NEWS_PROMPT.format(today=date.today().strftime("%B %d, %Y")))


if __name__ == "__main__":
    print(gather_news())
