import { getMatchupTeams } from '../utils/bracketLogic';

interface FinalFourProps {
  picks: Record<string, string | null>;
  onPick: (slotId: string, teamName: string) => void;
  isEditable: boolean;
  accentColor: string;
}

export default function FinalFour({ picks, onPick, isEditable, accentColor }: FinalFourProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center font-bold text-lg text-gray-700">Final Four</div>

      {/* Semifinal 1: East vs West */}
      <FinalFourMatchup
        slot="FF_G0"
        label="Semifinal 1"
        picks={picks}
        onPick={onPick}
        isEditable={isEditable}
        accentColor={accentColor}
      />

      {/* Championship */}
      <div className="py-2">
        <div className="text-center text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
          Championship
        </div>
        <FinalFourMatchup
          slot="CHAMP"
          label=""
          picks={picks}
          onPick={onPick}
          isEditable={isEditable}
          accentColor={accentColor}
        />
        {picks['CHAMP'] && (
          <div className="text-center mt-2">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Champion</div>
            <div className={`text-lg font-bold ${accentColor === 'amber' ? 'text-amber-600' : 'text-blue-600'}`}>
              🏆 {picks['CHAMP']}
            </div>
          </div>
        )}
      </div>

      {/* Semifinal 2: South vs Midwest */}
      <FinalFourMatchup
        slot="FF_G1"
        label="Semifinal 2"
        picks={picks}
        onPick={onPick}
        isEditable={isEditable}
        accentColor={accentColor}
      />
    </div>
  );
}

function FinalFourMatchup({
  slot,
  label,
  picks,
  onPick,
  isEditable,
  accentColor,
}: {
  slot: string;
  label: string;
  picks: Record<string, string | null>;
  onPick: (slotId: string, teamName: string) => void;
  isEditable: boolean;
  accentColor: string;
}) {
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
    <div className="w-56">
      {label && (
        <div className="text-center text-xs font-semibold text-gray-400 mb-1">{label}</div>
      )}
      <div className="bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden">
        <FFTeamSlot
          team={teamA}
          isSelected={!!teamA && winner === teamA}
          onClick={() => handlePick(teamA)}
          isEditable={isEditable}
          bgSelected={bgSelected}
          bgHover={bgHover}
        />
        <div className="border-t border-gray-200" />
        <FFTeamSlot
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

function FFTeamSlot({
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
      <div className="px-3 py-2 text-sm text-gray-300 italic text-center">
        TBD
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={!isEditable}
      className={`w-full px-3 py-2 text-center text-sm font-semibold truncate transition-colors ${
        isSelected
          ? bgSelected
          : `text-gray-700 ${isEditable ? bgHover + ' cursor-pointer' : ''}`
      }`}
    >
      {team}
    </button>
  );
}
