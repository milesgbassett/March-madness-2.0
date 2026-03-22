import { Link } from 'react-router-dom';
import { useBracketContext } from '../context/BracketContext';
import { scoreBracket, BracketScore } from '../utils/scoring';
import { ROUND_NAMES, ROUND_POINTS } from '../types';

export default function LeaderboardPage() {
  const { brackets, actualResults } = useBracketContext();

  const scored = brackets
    .map(bracket => ({
      bracket,
      score: scoreBracket(bracket.picks, actualResults.picks),
    }))
    .sort((a, b) => b.score.total - a.score.total || b.score.maxPossible - a.score.maxPossible);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-500">See how your brackets stack up against the actual results</p>
      </div>

      {brackets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-lg mb-4">No brackets to score yet.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
            Create a bracket
          </Link>
        </div>
      ) : (
        <>
          {/* Podium for top 3 */}
          {scored.length >= 1 && (
            <div className="flex justify-center items-end gap-4 mb-8">
              {scored.slice(0, 3).map((entry, idx) => (
                <div
                  key={entry.bracket.id}
                  className={`text-center px-6 py-4 rounded-xl ${
                    idx === 0
                      ? 'bg-yellow-50 border-2 border-yellow-400 shadow-lg'
                      : idx === 1
                      ? 'bg-gray-50 border-2 border-gray-300'
                      : 'bg-orange-50 border-2 border-orange-300'
                  }`}
                >
                  <div className="text-3xl mb-1">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </div>
                  <Link
                    to={`/bracket/${entry.bracket.id}`}
                    className="font-bold text-gray-800 hover:text-blue-600"
                  >
                    {entry.bracket.name}
                  </Link>
                  <div className="text-2xl font-bold text-blue-600 mt-1">
                    {entry.score.total} pts
                  </div>
                  <div className="text-xs text-gray-400">
                    Max possible: {entry.score.maxPossible}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detailed Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Bracket</th>
                    {ROUND_NAMES.map((name, i) => (
                      <th key={name} className="px-3 py-3 text-center font-semibold text-gray-600">
                        <div>{name}</div>
                        <div className="text-xs text-gray-400 font-normal">
                          {ROUND_POINTS[i + 1]} pts
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center font-semibold text-gray-800">Total</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Max Possible</th>
                  </tr>
                </thead>
                <tbody>
                  {scored.map((entry, idx) => (
                    <ScoreRow key={entry.bracket.id} entry={entry} rank={idx + 1} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scoring Legend */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-700 mb-2">Scoring System</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {ROUND_NAMES.map((name, i) => (
                <div key={name} className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">{name}</div>
                  <div className="font-bold text-blue-600">{ROUND_POINTS[i + 1]} pts</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ScoreRow({
  entry,
  rank,
}: {
  entry: { bracket: { id: string; name: string }; score: BracketScore };
  rank: number;
}) {
  const { score } = entry;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 font-medium text-gray-400">{rank}</td>
      <td className="px-4 py-3">
        <Link
          to={`/bracket/${entry.bracket.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {entry.bracket.name}
        </Link>
      </td>
      {[1, 2, 3, 4, 5, 6].map(round => (
        <td key={round} className="px-3 py-3 text-center">
          <span className="font-medium text-gray-700">{score.byRound[round].correct}</span>
          <span className="text-gray-400 text-xs">/{score.byRound[round].possible}</span>
          <div className="text-xs text-green-600">{score.byRound[round].points} pts</div>
        </td>
      ))}
      <td className="px-4 py-3 text-center">
        <span className="text-lg font-bold text-blue-600">{score.total}</span>
      </td>
      <td className="px-4 py-3 text-center text-gray-500">{score.maxPossible}</td>
    </tr>
  );
}
