import { useParams, Link } from 'react-router-dom';
import { useBracketContext } from '../context/BracketContext';
import BracketView from '../components/BracketView';

export default function BracketPage() {
  const { id } = useParams<{ id: string }>();
  const { brackets, updatePick } = useBracketContext();

  const bracket = brackets.find(b => b.id === id);

  if (!bracket) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Bracket not found</h2>
        <Link to="/" className="text-blue-600 hover:text-blue-800">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="py-4 px-2">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{bracket.name}</h1>
        </div>
      </div>
      <BracketView
        picks={bracket.picks}
        onPick={(slotId, team) => updatePick(bracket.id, slotId, team)}
        isEditable={true}
      />
    </div>
  );
}
