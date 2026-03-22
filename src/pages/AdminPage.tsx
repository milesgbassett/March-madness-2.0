import { useBracketContext } from '../context/BracketContext';
import BracketView from '../components/BracketView';

export default function AdminPage() {
  const { actualResults, setActualResult } = useBracketContext();

  return (
    <div className="py-4 px-2">
      <div className="px-4 mb-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-amber-800 mb-1">Actual Tournament Results</h1>
          <p className="text-amber-600 text-sm">
            Enter the real results as games are played. Your brackets will be scored against these picks.
          </p>
        </div>
      </div>
      <BracketView
        picks={actualResults.picks}
        onPick={(slotId, team) => setActualResult(slotId, team)}
        isEditable={true}
        isAdmin={true}
      />
    </div>
  );
}
