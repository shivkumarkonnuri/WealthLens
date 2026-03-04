import { Bell, Search, User, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  collapsed: boolean;
}

export function Header({ collapsed }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header 
      className="fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-40 flex items-center justify-between px-6 transition-all duration-300"
      style={{ left: collapsed ? '80px' : '256px' }}
    >
      {/* Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions, accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5 text-slate-600" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
        
        <button className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors relative">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="w-px h-8 bg-slate-200 mx-2"></div>

        <button className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-semibold text-slate-700">John Doe</p>
            <p className="text-xs text-slate-400">Premium</p>
          </div>
        </button>
      </div>
    </header>
  );
}
