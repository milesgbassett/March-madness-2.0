export type RegionName = 'East' | 'West' | 'South' | 'Midwest';

export interface Team {
  seed: number;
  name: string;
  region: RegionName;
}

export interface Bracket {
  id: string;
  name: string;
  createdAt: number;
  picks: Record<string, string | null>;
}

export interface AppState {
  brackets: Bracket[];
  actualResults: Bracket;
}

export const ROUND_NAMES = ['Round of 64', 'Round of 32', 'Sweet 16', 'Elite 8', 'Final Four', 'Championship'] as const;

export const ROUND_POINTS: Record<number, number> = {
  1: 1,   // Round of 64
  2: 2,   // Round of 32
  3: 4,   // Sweet 16
  4: 8,   // Elite 8
  5: 16,  // Final Four
  6: 32,  // Championship
};
