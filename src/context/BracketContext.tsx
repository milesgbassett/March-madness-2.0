import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AppState, Bracket } from '../types';
import { loadState, saveState, createNewBracket } from '../utils/localStorage';
import { makePick as makePickUtil } from '../utils/bracketLogic';

interface BracketContextValue {
  brackets: Bracket[];
  actualResults: Bracket;
  createBracket: (name: string) => void;
  deleteBracket: (id: string) => void;
  renameBracket: (id: string, name: string) => void;
  updatePick: (bracketId: string, slotId: string, teamName: string) => void;
  setActualResult: (slotId: string, teamName: string) => void;
  duplicateBracket: (id: string) => void;
}

const BracketContext = createContext<BracketContextValue | null>(null);

export function BracketProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());

  const persist = useCallback((newState: AppState) => {
    setState(newState);
    saveState(newState);
  }, []);

  const createBracket = useCallback((name: string) => {
    const bracket = createNewBracket(name);
    persist({ ...state, brackets: [...state.brackets, bracket] });
  }, [state, persist]);

  const deleteBracket = useCallback((id: string) => {
    persist({ ...state, brackets: state.brackets.filter(b => b.id !== id) });
  }, [state, persist]);

  const renameBracket = useCallback((id: string, name: string) => {
    persist({
      ...state,
      brackets: state.brackets.map(b => b.id === id ? { ...b, name } : b),
    });
  }, [state, persist]);

  const updatePick = useCallback((bracketId: string, slotId: string, teamName: string) => {
    if (bracketId === 'actual') {
      const newPicks = makePickUtil(state.actualResults.picks, slotId, teamName);
      persist({
        ...state,
        actualResults: { ...state.actualResults, picks: newPicks },
      });
    } else {
      persist({
        ...state,
        brackets: state.brackets.map(b => {
          if (b.id !== bracketId) return b;
          return { ...b, picks: makePickUtil(b.picks, slotId, teamName) };
        }),
      });
    }
  }, [state, persist]);

  const setActualResult = useCallback((slotId: string, teamName: string) => {
    updatePick('actual', slotId, teamName);
  }, [updatePick]);

  const duplicateBracket = useCallback((id: string) => {
    const source = state.brackets.find(b => b.id === id);
    if (!source) return;
    const newBracket: Bracket = {
      id: crypto.randomUUID(),
      name: `${source.name} (copy)`,
      createdAt: Date.now(),
      picks: { ...source.picks },
    };
    persist({ ...state, brackets: [...state.brackets, newBracket] });
  }, [state, persist]);

  return (
    <BracketContext.Provider value={{
      brackets: state.brackets,
      actualResults: state.actualResults,
      createBracket,
      deleteBracket,
      renameBracket,
      updatePick,
      setActualResult,
      duplicateBracket,
    }}>
      {children}
    </BracketContext.Provider>
  );
}

export function useBracketContext() {
  const ctx = useContext(BracketContext);
  if (!ctx) throw new Error('useBracketContext must be used within BracketProvider');
  return ctx;
}
