import React from 'react';
import { PlatformStats } from '../types';
import { X, BarChart3, CheckCircle2, Clock, Users, MessageSquare, Shield, Award } from 'lucide-react';

interface StatsModalProps {
  stats: PlatformStats | null;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose }) => {
  if (!stats) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Platform Performance & Metrics
              </h3>
              <p className="text-xs text-slate-500">
                Live statistics from CodeMentor MERN database service.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Submissions</span>
              <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
                {stats.totalSubmissions}
              </span>
              <span className="text-[10px] text-slate-400">Peer codebases in pool</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Open for Review</span>
              <span className="text-2xl font-extrabold text-emerald-900 font-mono mt-1 block">
                {stats.openCount}
              </span>
              <span className="text-[10px] text-emerald-700">Awaiting peer inspection</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">In Active Review</span>
              <span className="text-2xl font-extrabold text-amber-900 font-mono mt-1 block">
                {stats.inReviewCount}
              </span>
              <span className="text-[10px] text-amber-700">Under collaborative review</span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Completed & Closed</span>
              <span className="text-2xl font-extrabold text-blue-900 font-mono mt-1 block">
                {stats.completedCount}
              </span>
              <span className="text-[10px] text-blue-700">Passed quality standards</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400">Average Review Turnaround</div>
              <div className="text-xl font-bold font-mono text-emerald-400">{stats.avgTurnaroundTime}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 text-right">Reviewer Satisfaction</div>
              <div className="text-xl font-bold font-mono text-blue-400 text-right">{stats.satisfactionRate}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
