import React from 'react';
import { Search } from 'lucide-react';

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  activeLanguage: string;
  onSelectLanguage: (lang: string) => void;
}

const POPULAR_QUICK_TAGS = ['Java', 'React', 'Python', 'JavaScript', 'MERN Stack', 'MySQL', 'C++', 'OOP'];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  activeLanguage,
  onSelectLanguage,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
      {/* Soft Dribbble-style Mesh Gradient Orbs (from the reference screenshot) */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-16 -right-16 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-200/50 via-purple-300/40 to-blue-200/50 blur-3xl opacity-80" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute bottom-0 right-1/4 w-56 h-56 rounded-full bg-gradient-to-tr from-cyan-100/60 to-indigo-100/40 blur-2xl opacity-70" 
      />

      <div className="relative z-10 max-w-2xl">
        {/* Title matching Dokarti style */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
          Find student code reviews here
        </h1>
        
        {/* Subtitle with student context */}
        <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
          Browse practical college-level projects, semester assignments, and student code submissions. Get line-by-line feedback from fellow computer science peers.
        </p>

        {/* Integrated Search Bar */}
        <form onSubmit={onSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by project title, student username (@...), language, or tag..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-blue-500/25 active:scale-98 transition-all shrink-0 flex items-center justify-center gap-1.5"
          >
            Search
          </button>
        </form>

        {/* Quick Tech Tag Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Popular in Labs:</span>
          {POPULAR_QUICK_TAGS.map(tag => {
            const isSelected = activeLanguage === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectLanguage(isSelected ? 'All' : tag)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
