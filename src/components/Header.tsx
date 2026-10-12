import React from 'react';
import { User, PlatformStats } from '../types';
import { Code2, Plus, BarChart3, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  activeTab: 'explore' | 'my_reviews' | 'leaderboard' | 'docs';
  setActiveTab: (tab: 'explore' | 'my_reviews' | 'leaderboard' | 'docs') => void;
  onOpenSubmitModal: () => void;
  onOpenAuthModal: () => void;
  onOpenStatsModal: () => void;
  stats: PlatformStats | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenSubmitModal,
  onOpenAuthModal,
  onOpenStatsModal,
  stats,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setActiveTab('explore')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                Code<span className="text-blue-600">Mentor</span>
              </span>
              <span className="hidden sm:block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Student Peer Review
              </span>
            </div>
          </button>
        </div>

        {/* Center Nav Zone - Dokarti segmented pills style */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/80 border border-slate-200/60 rounded-xl text-sm font-medium">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-1.5 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
              activeTab === 'explore'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Find Projects
          </button>
          <button
            onClick={() => setActiveTab('my_reviews')}
            className={`px-4 py-1.5 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
              activeTab === 'my_reviews'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            My Submissions
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-1.5 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Top Reviewers
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-1.5 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
              activeTab === 'docs'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Lab Rubric
          </button>
        </nav>

        {/* Right Action Zone */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Platform Metrics button */}
          <button
            onClick={onOpenStatsModal}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200/80 transition-colors"
            title="View platform statistics"
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            <span>Campus Stats</span>
            {stats && (
              <span className="font-mono text-slate-500">
                ({stats.openCount} Open)
              </span>
            )}
          </button>

          {/* Submit Code CTA button */}
          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/25 active:scale-95 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Submit Project</span>
            <span className="sm:hidden">Submit</span>
          </button>

          {/* User profile dropdown button */}
          {currentUser ? (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2.5 p-1 sm:pr-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-800 to-indigo-900 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                {currentUser.avatar}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-blue-600 font-mono font-medium leading-none">
                  {currentUser.username}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Student Login
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav pills bar */}
      <div className="md:hidden flex items-center justify-around px-4 py-2 border-t border-slate-100 bg-slate-50/90 text-xs font-medium">
        <button
          onClick={() => setActiveTab('explore')}
          className={`py-1 px-2.5 rounded-md ${activeTab === 'explore' ? 'bg-white text-blue-600 shadow-xs font-semibold' : 'text-slate-600'}`}
        >
          Find Projects
        </button>
        <button
          onClick={() => setActiveTab('my_reviews')}
          className={`py-1 px-2.5 rounded-md ${activeTab === 'my_reviews' ? 'bg-white text-blue-600 shadow-xs font-semibold' : 'text-slate-600'}`}
        >
          My Submissions
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`py-1 px-2.5 rounded-md ${activeTab === 'leaderboard' ? 'bg-white text-blue-600 shadow-xs font-semibold' : 'text-slate-600'}`}
        >
          Reviewers
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`py-1 px-2.5 rounded-md ${activeTab === 'docs' ? 'bg-white text-blue-600 shadow-xs font-semibold' : 'text-slate-600'}`}
        >
          Lab Rubric
        </button>
      </div>
    </header>
  );
};
