import React from 'react';
import { FilterState } from '../types';
import { Filter, RotateCcw, Check } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onReset: () => void;
  totalMatches: number;
}

const REVIEW_TYPES = [
  'Course Assignment',
  'Mini Project',
  'Lab Practical',
  'Final Year Project',
  'Clean Code',
];

const DIFFICULTY_LEVELS = [
  'All',
  'Beginner',
  'Intermediate',
  'Advanced',
];

const LANGUAGES = [
  'All',
  'Java',
  'React',
  'Python',
  'JavaScript',
  'MERN Stack',
  'C++',
  'MySQL',
];

const STATUS_OPTIONS: Array<{ id: string; label: string; countDesc: string; color: string }> = [
  { id: 'Open', label: 'Open for Review', countDesc: 'Needs peers', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: 'In Review', label: 'In Active Review', countDesc: 'In progress', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { id: 'Completed', label: 'Completed / Approved', countDesc: 'Reviewed', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { id: 'Closed', label: 'Closed / Concluded', countDesc: 'Archived', color: 'text-slate-700 bg-slate-50 border-slate-200' },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  setFilters,
  onReset,
  totalMatches,
}) => {
  const toggleReviewType = (type: string) => {
    setFilters(prev => {
      const exists = prev.reviewTypes.includes(type);
      const updated = exists
        ? prev.reviewTypes.filter(t => t !== type)
        : [...prev.reviewTypes, type];
      return { ...prev, reviewTypes: updated };
    });
  };

  const toggleStatus = (statusId: string) => {
    setFilters(prev => {
      const exists = prev.statuses.includes(statusId);
      const updated = exists
        ? prev.statuses.filter(s => s !== statusId)
        : [...prev.statuses, statusId];
      return { ...prev, statuses: updated };
    });
  };

  return (
    <aside className="w-full bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-6">
      {/* Filter Header - Dokarti style */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-700" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Filter Projects</h2>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* 1. Primary Language Dropdown */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Programming Language
        </label>
        <div className="relative">
          <select
            value={filters.language}
            onChange={e => setFilters(prev => ({ ...prev, language: e.target.value }))}
            className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang}>
                {lang === 'All' ? 'All Languages & Tech' : lang}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. Review Type / Submission Category */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Assignment Category
          </label>
          {filters.reviewTypes.length > 0 && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, reviewTypes: [] }))}
              className="text-[11px] text-blue-600 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          {REVIEW_TYPES.map(type => {
            const isChecked = filters.reviewTypes.includes(type);
            return (
              <label
                key={type}
                className="flex items-center gap-2.5 cursor-pointer group text-xs select-none"
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                    isChecked
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'border border-slate-300 bg-white group-hover:border-slate-400'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isChecked}
                  onChange={() => toggleReviewType(type)}
                />
                <span
                  className={`transition-colors ${
                    isChecked ? 'text-slate-900 font-semibold' : 'text-slate-600 group-hover:text-slate-900'
                  }`}
                >
                  {type}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Difficulty Level: Beginner, Intermediate, Advanced */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Difficulty Level
        </label>
        <div className="space-y-2">
          {DIFFICULTY_LEVELS.map(level => {
            const isSelected = filters.difficulty === level;
            return (
              <label
                key={level}
                className="flex items-center gap-2.5 cursor-pointer group text-xs select-none"
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-4 border-blue-600 bg-white'
                      : 'border border-slate-300 bg-white group-hover:border-slate-400'
                  }`}
                />
                <input
                  type="radio"
                  name="difficulty"
                  className="sr-only"
                  checked={isSelected}
                  onChange={() => setFilters(prev => ({ ...prev, difficulty: level }))}
                />
                <span
                  className={`transition-colors ${
                    isSelected ? 'text-slate-900 font-semibold' : 'text-slate-600 group-hover:text-slate-900'
                  }`}
                >
                  {level === 'All' ? 'All Difficulty Levels' : level}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Code Scope (LOC) Slider */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Scope (Lines of Code)
          </label>
          <span className="text-xs font-semibold text-blue-600 font-mono">
            ≤ {filters.maxLoc} LOC
          </span>
        </div>
        <div className="px-1">
          <input
            type="range"
            min="30"
            max="300"
            step="15"
            value={filters.maxLoc}
            onChange={e => setFilters(prev => ({ ...prev, maxLoc: Number(e.target.value) }))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2">
            <span>30 LOC</span>
            <span>150 LOC</span>
            <span>300+ LOC</span>
          </div>
        </div>
      </div>

      {/* 5. Review Status: Open, In Review, Completed */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Review Status
          </label>
          {filters.statuses.length > 0 && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, statuses: [] }))}
              className="text-[11px] text-blue-600 hover:underline"
            >
              All
            </button>
          )}
        </div>
        <div className="space-y-2">
          {STATUS_OPTIONS.map(opt => {
            const isChecked = filters.statuses.includes(opt.id);
            return (
              <label
                key={opt.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                      isChecked
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={() => toggleStatus(opt.id)}
                  />
                  <span className={`font-medium ${isChecked ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
                    {opt.label}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {opt.countDesc}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="pt-2 border-t border-slate-100 text-center">
        <div className="text-xs text-slate-500 font-medium">
          Matches: <span className="font-bold text-slate-900 font-mono">{totalMatches}</span> student projects
        </div>
      </div>
    </aside>
  );
};
