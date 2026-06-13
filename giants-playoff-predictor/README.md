# Giants Playoff Predictor

Estimates the New York Giants' chance of making the NFL playoffs this season
using live web data and the Anthropic API (`claude-sonnet-4-6`).

## How it works

1. `get_team_stats.py` — uses Claude's server-side web search tool to gather
   the Giants' current record, NFC East standing, remaining schedule, and the
   NFC playoff/wild-card picture.
2. `search_news.py` — uses web search to summarize the last 1–2 weeks of
   Giants news: injuries, roster moves, coaching changes, performance trends.
3. `analyze.py` — sends the combined research to Claude with a JSON schema
   (structured outputs), returning `playoff_probability`, `reasoning`, and
   `confidence`.
4. `main.py` — runs the pipeline end-to-end and prints a formatted report.

`web_research.py` holds the shared web-search call (including `pause_turn`
continuation handling for the server-side tool loop).

If run during the offseason, the report covers the upcoming season's outlook
based on last season's finish and offseason moves.

## Setup

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...
```

## Run

```bash
python main.py
```
