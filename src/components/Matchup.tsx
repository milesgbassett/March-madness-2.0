import { getMatchupTeams } from '../utils/bracketLogic';

interface MatchupProps {
  slot: string;
  picks: Record<string, string | null>;
  onPick: (slotId: string, teamName: string) => void;
  isEditable: boolean;
  direction: 'ltr' | 'rtl';
  accentColor: string;
}

export default function Matchup({ slot, picks, onPick, isEditable, direction, accentColor }: MatchupProps) {
  const [teamA, teamB] = getMatchupTeams(picks, slot);
  const winner = picks[slot];

  const handlePick = (team: string | null) => {
    if (!isEditable || !team) return;
    onPick(slot, team);
  };

  const bgSelected = accentColor === 'amber'
    ? 'bg-amber-500 text-white'
    : 'bg-blue-600 text-white';

  const bgHover = accentColor === 'amber'
    ? 'hover:bg-amber-50'
    : 'hover:bg-blue-50';

  return (
    <div className={`w-44 flex-shrink-0 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`}>
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <TeamSlot
          team={teamA}
          isSelected={!!teamA && winner === teamA}
          onClick={() => handlePick(teamA)}
          isEditable={isEditable}
          bgSelected={bgSelected}
          bgHover={bgHover}
        />
        <div className="border-t border-gray-200" />
        <TeamSlot
          team={teamB}
          isSelected={!!teamB && winner === teamB}
          onClick={() => handlePick(teamB)}
          isEditable={isEditable}
          bgSelected={bgSelected}
          bgHover={bgHover}
        />
      </div>
    </div>
  );
}

function TeamSlot({
  team,
  isSelected,
  onClick,
  isEditable,
  bgSelected,
  bgHover,
}: {
  team: string | null;
  isSelected: boolean;
  onClick: () => void;
  isEditable: boolean;
  bgSelected: string;
  bgHover: string;
}) {
  if (!team) {
    return (
      <div className="px-2 py-1.5 text-xs text-gray-300 italic">
        TBD
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={!isEditable}
      className={`w-full px-2 py-1.5 text-left text-xs font-medium truncate transition-colors ${
        isSelected
          ? bgSelected
          : `text-gray-700 ${isEditable ? bgHover + ' cursor-pointer' : ''}`
      }`}
    >
      {team}
    </button>
  );
}
