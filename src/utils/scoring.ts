import { Bracket, ROUND_POINTS } from '../types';
import { getAllWinnerSlots, getSlotRound } from './bracketLogic';

export interface BracketScore {
  total: number;
  byRound: Record<number, { correct: number; possible: number; points: number }>;
  correctPicks: number;
  totalDecided: number;
  maxPossible: number;
}

export function scoreBracket(
  userPicks: Bracket['picks'],
  actualPicks: Bracket['picks']
): BracketScore {
  const byRound: Record<number, { correct: number; possible: number; points: number }> = {};
  for (let r = 1; r <= 6; r++) {
    byRound[r] = { correct: 0, possible: 0, points: 0 };
  }

  let total = 0;
  let correctPicks = 0;
  let totalDecided = 0;
  let maxPossible = 0;

  const allSlots = getAllWinnerSlots();

  for (const slot of allSlots) {
    const round = getSlotRound(slot);
    const points = ROUND_POINTS[round] || 0;
    const userPick = userPicks[slot];
    const actualPick = actualPicks[slot];

    if (actualPick) {
      // This game has been decided
      totalDecided++;
      if (userPick === actualPick) {
        correctPicks++;
        total += points;
        byRound[round].correct++;
        byRound[round].points += points;
        maxPossible += points;
      }
      byRound[round].possible++;
    } else {
      // Game not yet decided - check if user's pick is still alive
      if (userPick && isTeamStillAlive(userPick, actualPicks, slot)) {
        maxPossible += points;
      }
    }
  }

  return { total, byRound, correctPicks, totalDecided, maxPossible };
}

// Check if a team could still reach a given slot based on actual results so far
function isTeamStillAlive(
  teamName: string,
  actualPicks: Bracket['picks'],
  _targetSlot: string
): boolean {
  // Simple heuristic: the team is alive if they haven't been eliminated
  // A team is eliminated if there's an actual result in any slot where
  // they were a participant but didn't win
  const allSlots = getAllWinnerSlots();

  for (const slot of allSlots) {
    const actual = actualPicks[slot];
    if (!actual) continue;

    // Check if this team was in this matchup but lost
    const topKey = slot + '_T';
    const botKey = slot + '_B';
    if (actualPicks[topKey] === teamName || actualPicks[botKey] === teamName) {
      if (actual !== teamName) return false;
    }
  }

  return true;
}
