import { getGameTeams, generateGameId, getRegionForGame } from "../utils/bracket";
import { REGIONS, ROUND_NAMES } from "../data/teams";

function Game({ gameId, team1, team2, winner, onPick, editable, actualResult, round }) {
  const isCorrect = (team) =>
    actualResult && team && actualResult.name === team.name && actualResult.region === team.region;
  const isWrong = (team) =>
    actualResult && winner && team && winner.name === team.name && winner.region === team.region && !isCorrect(team);

  const handleClick = (team) => {
    if (editable && team) {
      onPick(gameId, team);
    }
  };

  const teamRow = (team, position) => {
    const isWinner =
      winner && team && winner.name === team.name && winner.region === team.region;
    const isLoser = winner && team && !isWinner;

    let className = "game-team";
    if (isWinner) className += " winner";
    if (isLoser) className += " loser";
    if (isCorrect(team) && isWinner) className += " correct";
    if (isWrong(team)) className += " wrong";
    if (editable && team) className += " clickable";

    return (
      <div
        className={className}
        onClick={() => handleClick(team)}
        key={position}
      >
        {team ? (
          <>
            <span className="seed">{team.seed}</span>
            <span className="team-name">{team.name}</span>
          </>
        ) : (
          <span className="tbd">---</span>
        )}
      </div>
    );
  };

  return (
    <div className={`game round-${round}`}>
      {teamRow(team1, "top")}
      <div className="game-divider" />
      {teamRow(team2, "bottom")}
    </div>
  );
}

function RegionBracket({ region, regionIndex, bracket, onPick, editable, actualBracket, mirrored }) {
  const rounds = [1, 2, 3, 4];
  const gamesPerRound = [8, 4, 2, 1];
  const baseOffset = regionIndex * 8; // offset into the 32 R1 games

  const columns = rounds.map((round) => {
    const numGames = gamesPerRound[round - 1];
    const games = [];

    for (let i = 0; i < numGames; i++) {
      const regionGameOffset = round === 1
        ? baseOffset
        : regionIndex * gamesPerRound[round - 1];
      const gameIndex = regionGameOffset + i + 1;
      const gameId = generateGameId(round, gameIndex);
      const [team1, team2] = getGameTeams(bracket, round, gameIndex);
      const winner = bracket.picks[gameId];
      const actualResult = actualBracket ? actualBracket.picks[gameId] : null;

      games.push(
        <div className="game-wrapper" key={gameId}>
          <Game
            gameId={gameId}
            team1={team1}
            team2={team2}
            winner={winner}
            onPick={onPick}
            editable={editable}
            actualResult={actualResult}
            round={round}
          />
        </div>
      );
    }

    return (
      <div className={`round-column round-${round}`} key={round}>
        <div className="round-label">{ROUND_NAMES[round - 1]}</div>
        <div className="round-games">{games}</div>
      </div>
    );
  });

  return (
    <div className={`region ${mirrored ? "mirrored" : ""}`}>
      <div className="region-header">{region}</div>
      <div className="region-rounds">{mirrored ? columns.reverse() : columns}</div>
    </div>
  );
}

function FinalFour({ bracket, onPick, editable, actualBracket }) {
  const renderGame = (round, gameIndex) => {
    const gameId = generateGameId(round, gameIndex);
    const [team1, team2] = getGameTeams(bracket, round, gameIndex);
    const winner = bracket.picks[gameId];
    const actualResult = actualBracket ? actualBracket.picks[gameId] : null;

    return (
      <Game
        gameId={gameId}
        team1={team1}
        team2={team2}
        winner={winner}
        onPick={onPick}
        editable={editable}
        actualResult={actualResult}
        round={round}
      />
    );
  };

  const champion = bracket.picks[generateGameId(6, 1)];

  return (
    <div className="final-four">
      <div className="ff-label">Final Four</div>
      <div className="ff-games">
        <div className="ff-semi">
          <div className="ff-matchup-label">East vs West</div>
          {renderGame(5, 1)}
        </div>
        <div className="ff-championship">
          <div className="ff-matchup-label">Championship</div>
          {renderGame(6, 1)}
          {champion && (
            <div className="champion-banner">
              🏆 {champion.seed} {champion.name}
            </div>
          )}
        </div>
        <div className="ff-semi">
          <div className="ff-matchup-label">South vs Midwest</div>
          {renderGame(5, 2)}
        </div>
      </div>
    </div>
  );
}

export default function Bracket({ bracket, onPick, editable, actualBracket }) {
  return (
    <div className="bracket-container">
      <div className="bracket-left">
        <RegionBracket
          region="East"
          regionIndex={0}
          bracket={bracket}
          onPick={onPick}
          editable={editable}
          actualBracket={actualBracket}
          mirrored={false}
        />
        <RegionBracket
          region="West"
          regionIndex={1}
          bracket={bracket}
          onPick={onPick}
          editable={editable}
          actualBracket={actualBracket}
          mirrored={false}
        />
      </div>

      <FinalFour
        bracket={bracket}
        onPick={onPick}
        editable={editable}
        actualBracket={actualBracket}
      />

      <div className="bracket-right">
        <RegionBracket
          region="South"
          regionIndex={2}
          bracket={bracket}
          onPick={onPick}
          editable={editable}
          actualBracket={actualBracket}
          mirrored={true}
        />
        <RegionBracket
          region="Midwest"
          regionIndex={3}
          bracket={bracket}
          onPick={onPick}
          editable={editable}
          actualBracket={actualBracket}
          mirrored={true}
        />
      </div>
    </div>
  );
}
