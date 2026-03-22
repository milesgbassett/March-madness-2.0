import { AppState, Bracket } from '../types';
import { createInitialPicks } from './bracketLogic';

const STORAGE_KEY = 'march-madness-app';

function createActualResultsBracket(): Bracket {
  return {
    id: 'actual',
    name: 'Actual Results',
    createdAt: Date.now(),
    picks: createInitialPicks(),
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
  }

  return {
    brackets: [],
    actualResults: createActualResultsBracket(),
  };
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

export function createNewBracket(name: string): Bracket {
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: Date.now(),
    picks: createInitialPicks(),
  };
}
