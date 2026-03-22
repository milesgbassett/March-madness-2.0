import { REGIONS, ROUND_SCORES, getInitialMatchups } from "../data/teams";

export function generateGameId(round, gameIndex) {
  return `R${round}G${gameIndex}`;
}

export function createEmptyBracket(id, name, isActual = false) {
  const picks = {};
  // Round 1: 32 games, Round 2: 16, ..., Round 6: 1
  let gamesInRound = 32;
  for (let round = 1; round <= 6; round++) {
    for (let g = 1; g <= gamesInRound; g++) {
      picks[generateGameId(round, g)] = null;
    }
    gamesInRound = gamesInRound / 2;
  }
  return { id, name, isActual, picks };
}

// Get the two teams that play in a given game
export function getGameTeams(bracket, round, gameIndex) {
  if (round === 1) {
    const matchups = getInitialMatchups();
    const matchup = matchups[gameIndex - 1];
    return matchup || [null, null];
  }

  // For rounds 2-4, feeder games are in the previous round
  // For round 5 (Final Four): East winner vs West winner (G1), South winner vs Midwest winner (G2)
  // For round 6 (Championship): winners of R5G1 vs R5G2

  if (round === 5) {
    // Final Four: region winners from round 4
    // R4G1 = East winner, R4G2 = West winner, R4G3 = South winner, R4G4 = Midwest winner
    if (gameIndex === 1) {
      return [
        bracket.picks[generateGameId(4, 1)],
        bracket.picks[generateGameId(4, 2)],
      ];
    } else {
      return [
        bracket.picks[generateGameId(4, 3)],
        bracket.picks[generateGameId(4, 4)],
      ];
    }
  }

  if (round === 6) {
    return [
      bracket.picks[generateGameId(5, 1)],
      bracket.picks[generateGameId(5, 2)],
    ];
  }

  // Rounds 2-4: standard feeder
  const feeder1 = generateGameId(round - 1, gameIndex * 2 - 1);
  const feeder2 = generateGameId(round - 1, gameIndex * 2);
  return [bracket.picks[feeder1], bracket.picks[feeder2]];
}

// Get region index for a round 1-4 game
export function getRegionForGame(round, gameIndex) {
  // Round 1: games 1-8 = East (idx 0), 9-16 = West (idx 1), 17-24 = South (idx 2), 25-32 = Midwest (idx 3)
  // Round 2: games 1-4 = East, 5-8 = West, etc.
  // Round 3: games 1-2 = East, 3-4 = West, etc.
  // Round 4: game 1 = East, 2 = West, 3 = South, 4 = Midwest
  const gamesPerRegion = Math.pow(2, 4 - round); // R1=8, R2=4, R3=2, R4=1
  const regionIdx = Math.floor((gameIndex - 1) / gamesPerRegion);
  return REGIONS[regionIdx];
}

// Cascade clear: when a pick changes, remove downstream picks that depended on the old winner
export function cascadeClear(picks, round, gameIndex, oldTeam) {
  if (!oldTeam || round >= 6) return picks;

  let nextRound, nextGame;

  if (round <= 3) {
    // Within region rounds
    nextRound = round + 1;
    nextGame = Math.ceil(gameIndex / 2);
  } else if (round === 4) {
    // Region final -> Final Four
    nextRound = 5;
    // East(G1) & West(G2) -> R5G1, South(G3) & Midwest(G4) -> R5G2
    nextGame = gameIndex <= 2 ? 1 : 2;
  } else if (round === 5) {
    nextRound = 6;
    nextGame = 1;
  }

  const nextId = generateGameId(nextRound, nextGame);
  if (
    picks[nextId] &&
    picks[nextId].name === oldTeam.name &&
    picks[nextId].region === oldTeam.region
  ) {
    const removed = picks[nextId];
    picks[nextId] = null;
    cascadeClear(picks, nextRound, nextGame, removed);
  }

  return picks;
}

// Score a user bracket against actual results
export function scoreBracket(userBracket, actualBracket) {
  const byRound = [0, 0, 0, 0, 0, 0];
  let total = 0;
  let gamesInRound = 32;

  for (let round = 1; round <= 6; round++) {
    for (let g = 1; g <= gamesInRound; g++) {
      const gameId = generateGameId(round, g);
      const userPick = userBracket.picks[gameId];
      const actualPick = actualBracket.picks[gameId];
      if (
        userPick &&
        actualPick &&
        userPick.name === actualPick.name &&
        userPick.region === actualPick.region
      ) {
        byRound[round - 1] += ROUND_SCORES[round - 1];
        total += ROUND_SCORES[round - 1];
      }
    }
    gamesInRound = gamesInRound / 2;
  }

  return { total, byRound };
}

// Count how many picks are filled in a bracket
export function countPicks(bracket) {
  return Object.values(bracket.picks).filter(Boolean).length;
}
