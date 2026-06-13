"""Gathers the Giants' record, standings, and schedule via Claude web search."""

from datetime import date

from web_research import run_web_research

STATS_PROMPT = """\
Today is {today}. Use web search to find current facts about the New York
Giants (NFL) and summarize them concisely (under 300 words):

- Current win-loss record and position in the NFC East standings
- Remaining schedule: opponents, home/away, and how strong those opponents are
- The NFC playoff picture: division leaders, the current wild-card teams, and
  which teams the Giants are competing with for a spot

If the NFL is between seasons right now, say so explicitly and instead
summarize last season's record and where the Giants finished, plus anything
known about the upcoming season's schedule and the NFC East outlook.
"""


def gather_team_stats() -> str:
    """Return a summary of the Giants' record, standings, and remaining schedule."""
    return run_web_research(STATS_PROMPT.format(today=date.today().strftime("%B %d, %Y")))


if __name__ == "__main__":
    print(gather_team_stats())
