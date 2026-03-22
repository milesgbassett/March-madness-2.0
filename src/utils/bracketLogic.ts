import { Bracket, RegionName } from '../types';
import { TOURNAMENT_TEAMS, SEED_MATCHUP_ORDER, REGIONS } from '../constants/teams';

// Slot ID format:
// Regional rounds: R{regionIndex}_RD{round}_G{game}
//   regionIndex: 0=East, 1=West, 2=South, 3=Midwest
//   round: 1=R64, 2=R32, 3=Sweet16, 4=Elite8
//   game: 0-based index
// Final Four: FF_G0 (East vs West winners), FF_G1 (South vs Midwest winners)
// Championship: CHAMP

export function getRegionIndex(region: RegionName): number {
  return REGIONS.indexOf(region);
}

export function slotId(regionIdx: number, round: number, game: number): string {
  return `R${regionIdx}_RD${round}_G${game}`;
}

// Get the two parent (feeder) slots for a given slot
export function getParentSlots(slot: string): [string, string] | null {
  if (slot === 'CHAMP') {
    return ['FF_G0', 'FF_G1'];
  }
  if (slot === 'FF_G0') {
    return [slotId(0, 4, 0), slotId(1, 4, 0)]; // East vs West
  }
  if (slot === 'FF_G1') {
    return [slotId(2, 4, 0), slotId(3, 4, 0)]; // South vs Midwest
  }

  const match = slot.match(/^R(\d+)_RD(\d+)_G(\d+)$/);
  if (!match) return null;

  const regionIdx = parseInt(match[1]);
  const round = parseInt(match[2]);
  const game = parseInt(match[3]);

  if (round === 1) return null; // Round of 64 has no parents (teams are seeded)

  return [
    slotId(regionIdx, round - 1, game * 2),
    slotId(regionIdx, round - 1, game * 2 + 1),
  ];
}

// Get the child (downstream) slot that this slot feeds into
export function getChildSlot(slot: string): string | null {
  if (slot === 'CHAMP') return null;
  if (slot === 'FF_G0' || slot === 'FF_G1') return 'CHAMP';

  const match = slot.match(/^R(\d+)_RD(\d+)_G(\d+)$/);
  if (!match) return null;

  const regionIdx = parseInt(match[1]);
  const round = parseInt(match[2]);
  const game = parseInt(match[3]);

  if (round === 4) {
    // Elite 8 winners go to Final Four
    return regionIdx <= 1 ? 'FF_G0' : 'FF_G1';
  }

  return slotId(regionIdx, round + 1, Math.floor(game / 2));
}

// Get the round number for a slot (1-6)
export function getSlotRound(slot: string): number {
  if (slot === 'CHAMP') return 6;
  if (slot.startsWith('FF_')) return 5;
  const match = slot.match(/^R\d+_RD(\d+)_G\d+$/);
  return match ? parseInt(match[1]) : 0;
}

// Create initial picks with Round 1 pre-populated
export function createInitialPicks(): Record<string, string | null> {
  const picks: Record<string, string | null> = {};

  // Fill Round 1 with seeded teams
  REGIONS.forEach((region, regionIdx) => {
    const teams = TOURNAMENT_TEAMS[region];
    SEED_MATCHUP_ORDER.forEach(([seedA, seedB], gameIdx) => {
      const teamA = teams.find(t => t.seed === seedA)!;
      const teamB = teams.find(t => t.seed === seedB)!;
      // Each Round 1 game has two "source" positions; we encode the winner slot
      // The teams are the inputs, the slot holds the winner pick
      picks[`R${regionIdx}_RD1_G${gameIdx}_T`] = `${teamA.seed} ${teamA.name}`;
      picks[`R${regionIdx}_RD1_G${gameIdx}_B`] = `${teamB.seed} ${teamB.name}`;
    });

    // Initialize all result slots as null
    for (let game = 0; game < 8; game++) {
      picks[slotId(regionIdx, 1, game)] = null;
    }
    for (let game = 0; game < 4; game++) {
      picks[slotId(regionIdx, 2, game)] = null;
    }
    for (let game = 0; game < 2; game++) {
      picks[slotId(regionIdx, 3, game)] = null;
    }
    picks[slotId(regionIdx, 4, 0)] = null;
  });

  picks['FF_G0'] = null;
  picks['FF_G1'] = null;
  picks['CHAMP'] = null;

  return picks;
}

// Get the two teams available for a matchup at a given slot
export function getMatchupTeams(picks: Record<string, string | null>, slot: string): [string | null, string | null] {
  if (slot.match(/^R\d+_RD1_G\d+$/)) {
    // Round 1: teams come from the seeded _T and _B entries
    const topKey = slot + '_T';
    const botKey = slot + '_B';
    return [picks[topKey] || null, picks[botKey] || null];
  }

  const parents = getParentSlots(slot);
  if (!parents) return [null, null];

  return [picks[parents[0]] || null, picks[parents[1]] || null];
}

// Make a pick and cascade-clear any invalidated downstream picks
export function makePick(
  picks: Record<string, string | null>,
  slot: string,
  teamName: string
): Record<string, string | null> {
  const newPicks = { ...picks };
  const oldPick = newPicks[slot];
  newPicks[slot] = teamName;

  // If we changed the pick, cascade clear downstream
  if (oldPick && oldPick !== teamName) {
    clearTeamDownstream(newPicks, slot, oldPick);
  }

  return newPicks;
}

function clearTeamDownstream(
  picks: Record<string, string | null>,
  fromSlot: string,
  teamName: string
): void {
  const child = getChildSlot(fromSlot);
  if (!child) return;

  if (picks[child] === teamName) {
    picks[child] = null;
    clearTeamDownstream(picks, child, teamName);
  }
}

// Get all winner slots (not the _T/_B source slots)
export function getAllWinnerSlots(): string[] {
  const slots: string[] = [];

  for (let r = 0; r < 4; r++) {
    for (let g = 0; g < 8; g++) slots.push(slotId(r, 1, g));
    for (let g = 0; g < 4; g++) slots.push(slotId(r, 2, g));
    for (let g = 0; g < 2; g++) slots.push(slotId(r, 3, g));
    slots.push(slotId(r, 4, 0));
  }

  slots.push('FF_G0', 'FF_G1', 'CHAMP');
  return slots;
}
