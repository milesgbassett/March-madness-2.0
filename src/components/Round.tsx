import Matchup from './Matchup';

interface RoundProps {
  round: number;
  slots: string[];
  picks: Record<string, string | null>;
  onPick: (slotId: string, teamName: string) => void;
  isEditable: boolean;
  direction: 'ltr' | 'rtl';
  accentColor: string;
}

// Spacing increases each round to align with bracket structure
const ROUND_GAP: Record<number, string> = {
  1: 'gap-1',
  2: 'gap-9',
  3: 'gap-[76px]',
  4: 'gap-[172px]',
};

export default function Round({ round, slots, picks, onPick, isEditable, direction, accentColor }: RoundProps) {
  return (
    <div className={`flex flex-col ${ROUND_GAP[round] || 'gap-1'} flex-shrink-0`}>
      {slots.map(slot => (
        <Matchup
          key={slot}
          slot={slot}
          picks={picks}
          onPick={onPick}
          isEditable={isEditable}
          direction={direction}
          accentColor={accentColor}
        />
      ))}
    </div>
  );
}
