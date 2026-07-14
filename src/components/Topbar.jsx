import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Topbar({ onMenuClick }) {
  const { email, logout } = useAuth();

  return (
    <header className="h-16 border-b border-white/6 flex items-center justify-between px-4 sm:px-6 sticky top-0 bg-[#0A0B10]/85 backdrop-blur-md z-20">
      <button onClick={onMenuClick} className="lg:hidden text-slate-400 hover:text-white">
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[11px] font-bold text-white">
            {email?.[0]?.toUpperCase()}
          </div>
          <span className="text-slate-300 hidden sm:inline">{email}</span>
        </div>
        <button onClick={logout} className="btn-ghost text-sm flex items-center space-x-1.5 !px-3">
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
