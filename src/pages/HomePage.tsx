import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBracketContext } from '../context/BracketContext';

export default function HomePage() {
  const { brackets, createBracket, deleteBracket, duplicateBracket } = useBracketContext();
  const [newName, setNewName] = useState('');
  const [showDelete, setShowDelete] = useState<string | null>(null);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    createBracket(name);
    setNewName('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Brackets</h1>
        <p className="text-gray-500">Create multiple brackets and see which one does the best!</p>
      </div>

      {/* Create New Bracket */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Bracket</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Enter bracket name (e.g., 'Chalk Picks', 'Upset Special')"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create
          </button>
        </div>
      </div>

      {/* Bracket List */}
      {brackets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-lg">No brackets yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {brackets.map(bracket => (
            <div
              key={bracket.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <Link
                  to={`/bracket/${bracket.id}`}
                  className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                >
                  {bracket.name}
                </Link>
                <p className="text-sm text-gray-400">
                  Created {new Date(bracket.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/bracket/${bracket.id}`}
                  className="px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => duplicateBracket(bracket.id)}
                  className="px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                >
                  Duplicate
                </button>
                {showDelete === bracket.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => { deleteBracket(bracket.id); setShowDelete(null); }}
                      className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowDelete(null)}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDelete(bracket.id)}
                    className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
