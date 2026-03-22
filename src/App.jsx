import { useState, useCallback } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import {
  createEmptyBracket,
  scoreBracket,
  countPicks,
  cascadeClear,
} from "./utils/bracket";
import { ROUND_NAMES, ROUND_SCORES } from "./data/teams";
import Bracket from "./components/Bracket";
import "./App.css";

function App() {
  const [brackets, setBrackets] = useLocalStorage("mm_brackets", []);
  const [actualBracket, setActualBracket] = useLocalStorage(
    "mm_actual",
    createEmptyBracket("actual", "Actual Results", true)
  );
  const [view, setView] = useState("home");
  const [activeBracketId, setActiveBracketId] = useState(null);
  const [newBracketName, setNewBracketName] = useState("");

  const activeBracket =
    activeBracketId === "actual"
      ? actualBracket
      : brackets.find((b) => b.id === activeBracketId);

  const handlePick = useCallback(
    (gameId, team) => {
      const isActual = activeBracketId === "actual";
      const bracket = isActual
        ? actualBracket
        : brackets.find((b) => b.id === activeBracketId);
      if (!bracket) return;

      const newPicks = { ...bracket.picks };
      const oldWinner = newPicks[gameId];

      const match = gameId.match(/R(\d)G(\d+)/);
      const round = parseInt(match[1]);
      const gameIndex = parseInt(match[2]);

      if (
        oldWinner &&
        (oldWinner.name !== team.name || oldWinner.region !== team.region)
      ) {
        cascadeClear(newPicks, round, gameIndex, oldWinner);
      }

      newPicks[gameId] = team;

      const updated = { ...bracket, picks: newPicks };

      if (isActual) {
        setActualBracket(updated);
      } else {
        setBrackets((prev) =>
          prev.map((b) => (b.id === activeBracketId ? updated : b))
        );
      }
    },
    [activeBracketId, actualBracket, brackets, setActualBracket, setBrackets]
  );

  const handleCreateBracket = () => {
    const name = newBracketName.trim();
    if (!name) return;
    const id = crypto.randomUUID();
    const bracket = createEmptyBracket(id, name);
    setBrackets((prev) => [...prev, bracket]);
    setNewBracketName("");
  };

  const handleDeleteBracket = (id) => {
    setBrackets((prev) => prev.filter((b) => b.id !== id));
  };

  const handleDuplicateBracket = (id) => {
    const source = brackets.find((b) => b.id === id);
    if (!source) return;
    const newId = crypto.randomUUID();
    const dup = {
      ...source,
      id: newId,
      name: `${source.name} (copy)`,
      picks: { ...source.picks },
    };
    setBrackets((prev) => [...prev, dup]);
  };

  const openBracket = (id) => {
    setActiveBracketId(id);
    setView("edit");
  };

  const actualHasPicks = countPicks(actualBracket) > 0;

  if (view === "edit" && activeBracket) {
    return (
      <div className="app">
        <header className="app-header">
          <button className="btn btn-back" onClick={() => setView("home")}>
            ← Back
          </button>
          <h1 className="bracket-title">{activeBracket.name}</h1>
          <div className="header-info">
            {countPicks(activeBracket)}/63 picks
          </div>
        </header>
        <Bracket
          bracket={activeBracket}
          onPick={handlePick}
          editable={true}
          actualBracket={
            activeBracketId !== "actual" && actualHasPicks
              ? actualBracket
              : null
          }
        />
      </div>
    );
  }

  if (view === "leaderboard") {
    const scored = brackets.map((b) => ({
      ...b,
      score: scoreBracket(b, actualBracket),
    }));
    scored.sort((a, b) => b.score.total - a.score.total);

    return (
      <div className="app">
        <header className="app-header">
          <button className="btn btn-back" onClick={() => setView("home")}>
            ← Back
          </button>
          <h1>Leaderboard</h1>
        </header>
        <div className="leaderboard-container">
          {!actualHasPicks && (
            <p className="empty-message">
              Enter actual results first to see scores.
            </p>
          )}
          {actualHasPicks && scored.length === 0 && (
            <p className="empty-message">No brackets to score yet.</p>
          )}
          {actualHasPicks && scored.length > 0 && (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Bracket</th>
                  {ROUND_NAMES.map((name, i) => (
                    <th key={i} title={`${ROUND_SCORES[i]} pts each`}>
                      {name}
                    </th>
                  ))}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {scored.map((b, idx) => (
                  <tr key={b.id}>
                    <td className="rank">{idx + 1}</td>
                    <td className="bracket-name">{b.name}</td>
                    {b.score.byRound.map((s, i) => (
                      <td key={i}>{s}</td>
                    ))}
                    <td className="total">{b.score.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="scoring-info">
            <h3>Scoring</h3>
            <p>
              {ROUND_NAMES.map(
                (name, i) => `${name}: ${ROUND_SCORES[i]} pts`
              ).join(" | ")}
            </p>
            <p>
              <strong>Max possible: 1,920 pts</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>March Madness Bracket Tracker</h1>
      </header>

      <div className="home-container">
        <div className="home-actions">
          <div className="create-bracket">
            <input
              type="text"
              placeholder="New bracket name..."
              value={newBracketName}
              onChange={(e) => setNewBracketName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateBracket()}
              maxLength={50}
            />
            <button
              className="btn btn-primary"
              onClick={handleCreateBracket}
              disabled={!newBracketName.trim()}
            >
              Create Bracket
            </button>
          </div>

          <div className="home-buttons">
            <button
              className="btn btn-actual"
              onClick={() => openBracket("actual")}
            >
              Edit Actual Results
            </button>
            <button
              className="btn btn-leaderboard"
              onClick={() => setView("leaderboard")}
              disabled={brackets.length === 0}
            >
              Leaderboard
            </button>
          </div>
        </div>

        <div className="bracket-list">
          <h2>My Brackets ({brackets.length})</h2>
          {brackets.length === 0 && (
            <p className="empty-message">
              No brackets yet. Create one to get started!
            </p>
          )}
          {brackets.map((b) => {
            const score = actualHasPicks
              ? scoreBracket(b, actualBracket)
              : null;
            const picks = countPicks(b);
            return (
              <div className="bracket-card" key={b.id}>
                <div className="bracket-card-info">
                  <h3>{b.name}</h3>
                  <div className="bracket-card-meta">
                    <span>{picks}/63 picks</span>
                    {score && (
                      <span className="bracket-card-score">
                        Score: {score.total}
                      </span>
                    )}
                  </div>
                </div>
                <div className="bracket-card-actions">
                  <button
                    className="btn btn-sm"
                    onClick={() => openBracket(b.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => handleDuplicateBracket(b.id)}
                  >
                    Duplicate
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteBracket(b.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
