import React from 'react';
import { User, PlatformStats } from '../types';
import { Trophy, Star, GraduationCap } from 'lucide-react';

interface LeaderboardViewProps {
  users: User[];
  stats: PlatformStats | null;
  onOpenSubmit: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ users, stats, onOpenSubmit }) => {
  const sortedUsers = [...users].sort((a, b) => b.reputation - a.reputation);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-3">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>Campus Peer Mentor Rankings</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Top Student Reviewers & Mentors
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Students earn reputation points by leaving helpful, line-by-line feedback on classmates' assignments, spotting logic bugs, and explaining clean coding practices.
          </p>
        </div>

        {/* Highlight Stats Strip */}
        {stats && (
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Active Reviewers</div>
              <div className="text-xl font-bold font-mono text-white mt-0.5">{stats.activeMentors}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Projects</div>
              <div className="text-xl font-bold font-mono text-white mt-0.5">{stats.totalSubmissions}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Peer Comments</div>
              <div className="text-xl font-bold font-mono text-white mt-0.5">{stats.totalComments}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Avg Turnaround</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{stats.avgTurnaroundTime}</div>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Student Rankings</h3>
          <span className="text-xs text-slate-400">Ranked by Peer Reputation</span>
        </div>

        <div className="divide-y divide-slate-100">
          {sortedUsers.map((u, idx) => {
            const rank = idx + 1;
            return (
              <div
                key={u.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  {/* Rank indicator */}
                  <div className="w-8 text-center shrink-0">
                    {rank === 1 ? (
                      <span className="inline-flex w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold text-xs items-center justify-center">1</span>
                    ) : rank === 2 ? (
                      <span className="inline-flex w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs items-center justify-center">2</span>
                    ) : rank === 3 ? (
                      <span className="inline-flex w-7 h-7 rounded-full bg-amber-50 text-amber-800 font-bold text-xs items-center justify-center">3</span>
                    ) : (
                      <span className="font-mono text-xs font-semibold text-slate-400">{rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-900 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    {u.avatar}
                  </div>

                  {/* Details */}
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate flex items-center gap-2">
                      <span>{u.name}</span>
                      <span className="text-xs font-mono text-blue-600 font-semibold">{u.username}</span>
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      <span>{u.role}</span>
                      <span className="text-slate-300 mx-1">·</span>
                      <span className="text-slate-400">{u.college}</span>
                    </div>
                  </div>
                </div>

                {/* Score & Activity */}
                <div className="flex items-center gap-4 sm:gap-8 shrink-0 text-right">
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold font-mono text-slate-800">
                      {u.reviewsCount}
                    </div>
                    <div className="text-[10px] text-slate-400">Reviews Done</div>
                  </div>

                  <div className="hidden sm:block">
                    <div className="text-xs font-bold font-mono text-slate-800">
                      {u.submissionsCount}
                    </div>
                    <div className="text-[10px] text-slate-400">Submitted</div>
                  </div>

                  <div>
                    <div className="text-sm font-bold font-mono text-blue-600 flex items-center justify-end gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{u.reputation}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Reputation</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
