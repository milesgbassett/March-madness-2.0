import { slotId } from '../utils/bracketLogic';
import Round from './Round';

interface RegionProps {
  regionIndex: number;
  picks: Record<string, string | null>;
  onPick: (slotId: string, teamName: string) => void;
  isEditable: boolean;
  direction: 'ltr' | 'rtl';
  accentColor: string;
}

export default function Region({ regionIndex, picks, onPick, isEditable, direction, accentColor }: RegionProps) {
  const rounds = [
    { round: 1, games: 8 },
    { round: 2, games: 4 },
    { round: 3, games: 2 },
    { round: 4, games: 1 },
  ];

  const roundColumns = rounds.map(({ round, games }) => {
    const slots: string[] = [];
    for (let g = 0; g < games; g++) {
      slots.push(slotId(regionIndex, round, g));
    }
    return { round, slots };
  });

  const ordered = direction === 'rtl' ? [...roundColumns].reverse() : roundColumns;

  return (
    <div className={`flex ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'} items-center`}>
      {ordered.map(({ round, slots }) => (
        <Round
          key={round}
          round={round}
          slots={slots}
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
