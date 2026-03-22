import { Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BracketPage from './pages/BracketPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-white text-blue-700 shadow-sm'
          : 'text-blue-100 hover:bg-blue-500 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🏀</span>
              <span className="text-white font-bold text-lg">March Madness Tracker</span>
            </Link>
            <div className="flex items-center space-x-2">
              <NavLink to="/">Brackets</NavLink>
              <NavLink to="/leaderboard">Leaderboard</NavLink>
              <NavLink to="/admin">Results</NavLink>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-full mx-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bracket/:id" element={<BracketPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
}
