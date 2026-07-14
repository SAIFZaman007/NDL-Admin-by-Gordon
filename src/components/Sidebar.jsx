import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Newspaper, Star,
  CreditCard, MessageCircleQuestion, ClipboardList, Info,
  ExternalLink, Layers,
} from 'lucide-react';

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/courses', label: 'Courses & Lessons', icon: BookOpen },
  { to: '/learning-paths', label: 'Learning Paths', icon: Layers },
  { to: '/blog', label: 'Blog Posts', icon: Newspaper },
  { to: '/testimonials', label: 'Testimonials', icon: Star },
  { to: '/subscriptions', label: 'Subscription Plans', icon: CreditCard },
  { to: '/interview-questions', label: 'Interview Questions', icon: MessageCircleQuestion },
  { to: '/exam-questions', label: 'Exam Questions', icon: ClipboardList },
  { to: '/about', label: 'About Page Content', icon: Info },
];

function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#0A0B10] border-r border-white/6 z-40 flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center px-5 border-b border-white/6 shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
          <img src="/logo-mark.png" alt="Network Design Labs" className="w-15 h-8 rounded-lg shrink-0" />
          <div className="min-w-0">
          <div className="font-display font-800 text-sm tracking-tight text-white leading-snug truncate">
          Network Design <span className="text-blue-400">Labs</span>
        </div>
        <div className="text-[10px] text-slate-500 font-medium">Admin Dashboard</div>
        </div>
        </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/6 shrink-0">
          <a
            href={FRONTEND_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-link"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span>View Live Site</span>
          </a>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;