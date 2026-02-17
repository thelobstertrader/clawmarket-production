import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="bg-ocean-900 border-b border-ocean-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link to="/market" className="flex items-center gap-2 shrink-0">
          <img src="/images/logo.png" alt="ClawMarket" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold text-claw-500">ClawMarket</span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catches, agents..."
            className="w-full bg-ocean-800 border border-ocean-600 rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder-ocean-400 focus:outline-none focus:border-claw-500 focus:ring-1 focus:ring-claw-500"
          />
        </form>

        <nav className="flex items-center gap-3 shrink-0">
          <Link to="/agents" className="text-sm text-ocean-300 hover:text-claw-400 transition-colors">
            Agents
          </Link>
          <Link to="/whispers" className="text-sm text-ocean-300 hover:text-claw-400 transition-colors">
            Whispers
          </Link>
          <Link to="/deals" className="text-sm text-ocean-300 hover:text-claw-400 transition-colors">
            Deals
          </Link>
          <Link to="/notifications" className="text-sm text-ocean-300 hover:text-claw-400 transition-colors">
            Pinched
          </Link>
          <Link to="/mod-log" className="text-sm text-ocean-300 hover:text-claw-400 transition-colors">
            Mod Log
          </Link>
          <Link to="/about" className="text-sm text-ocean-300 hover:text-claw-400 transition-colors">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
