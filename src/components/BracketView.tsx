import { REGIONS } from '../constants/teams';
import Region from './Region';
import FinalFour from './FinalFour';

interface BracketViewProps {
  picks: Record<string, string | null>;
  onPick: (slotId: string, teamName: string) => void;
  isEditable: boolean;
  isAdmin?: boolean;
}

export default function BracketView({ picks, onPick, isEditable, isAdmin }: BracketViewProps) {
  const accentColor = isAdmin ? 'amber' : 'blue';

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[1400px] px-4">
        {/* Top half: East (LTR) and West (RTL) */}
        <div className="flex items-start">
          <div className="flex-1">
            <div className="text-center font-bold text-lg text-gray-700 mb-2">{REGIONS[0]}</div>
            <Region
              regionIndex={0}
              picks={picks}
              onPick={onPick}
              isEditable={isEditable}
              direction="ltr"
              accentColor={accentColor}
            />
          </div>
          <div className="w-72 flex-shrink-0 pt-8">
            <FinalFour
              picks={picks}
              onPick={onPick}
              isEditable={isEditable}
              accentColor={accentColor}
            />
          </div>
          <div className="flex-1">
            <div className="text-center font-bold text-lg text-gray-700 mb-2">{REGIONS[1]}</div>
            <Region
              regionIndex={1}
              picks={picks}
              onPick={onPick}
              isEditable={isEditable}
              direction="rtl"
              accentColor={accentColor}
            />
          </div>
        </div>

        {/* Bottom half: South (LTR) and Midwest (RTL) */}
        <div className="flex items-start mt-8">
          <div className="flex-1">
            <div className="text-center font-bold text-lg text-gray-700 mb-2">{REGIONS[2]}</div>
            <Region
              regionIndex={2}
              picks={picks}
              onPick={onPick}
              isEditable={isEditable}
              direction="ltr"
              accentColor={accentColor}
            />
          </div>
          <div className="w-72 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-center font-bold text-lg text-gray-700 mb-2">{REGIONS[3]}</div>
            <Region
              regionIndex={3}
              picks={picks}
              onPick={onPick}
              isEditable={isEditable}
              direction="rtl"
              accentColor={accentColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
