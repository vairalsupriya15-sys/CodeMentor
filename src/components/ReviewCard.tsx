import React, { useState } from 'react';
import { CodeReview } from '../types';
import { Bookmark, Star, MessageSquare, Clock, ArrowRight, Code2 } from 'lucide-react';

interface ReviewCardProps {
  review: CodeReview;
  onOpenDetails: (review: CodeReview) => void;
  onToggleBookmark: (id: string) => void;
  onSelectTag?: (tag: string) => void;
}

// Tech logo / icon generator for college-level languages & frameworks
const getReviewBadgeIcon = (language: string) => {
  const lang = language.toLowerCase();
  if (lang.includes('java') && !lang.includes('script')) return { bg: 'bg-orange-50 text-orange-600 border-orange-200', text: 'Java' };
  if (lang.includes('react')) return { bg: 'bg-sky-50 text-sky-600 border-sky-200', text: 'React' };
  if (lang.includes('python')) return { bg: 'bg-emerald-50 text-emerald-600 border-emerald-200', text: 'Python' };
  if (lang.includes('javascript') || lang.includes('js')) return { bg: 'bg-amber-50 text-amber-600 border-amber-200', text: 'JS' };
  if (lang.includes('mern')) return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'MERN' };
  if (lang.includes('c++') || lang.includes('cpp')) return { bg: 'bg-blue-50 text-blue-600 border-blue-200', text: 'C++' };
  return { bg: 'bg-indigo-50 text-indigo-600 border-indigo-200', text: 'Code' };
};

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onOpenDetails,
  onToggleBookmark,
  onSelectTag,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(review.isBookmarked ?? false);
  const badge = getReviewBadgeIcon(review.language);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(prev => !prev);
    onToggleBookmark(review.id);
  };

  // Status badge colors matching screenshot
  const statusStyles = {
    'Open': 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    'In Review': 'bg-amber-50 text-amber-700 border-amber-200/80',
    'Completed': 'bg-blue-50 text-blue-700 border-blue-200/80',
    'Closed': 'bg-slate-100 text-slate-700 border-slate-200/80',
  }[review.status] || 'bg-slate-100 text-slate-700 border-slate-200/80';

  // Difficulty badge styling
  const difficultyStyles = {
    'Beginner': 'text-emerald-700 bg-emerald-50/60 border-emerald-200/60',
    'Intermediate': 'text-blue-700 bg-blue-50/60 border-blue-200/60',
    'Advanced': 'text-purple-700 bg-purple-50/60 border-purple-200/60',
  }[review.difficulty] || 'text-slate-700 bg-slate-50 border-slate-200';

  const formatTimeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <article
      onClick={() => onOpenDetails(review)}
      className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-lg hover:border-blue-400/80 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Top Row: Language Icon + Project Title + Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-11 rounded-xl border flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs ${badge.bg}`}
              title={review.language}
            >
              {badge.text}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {review.title}
              </h3>
              
              {/* Student username & details */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-semibold text-blue-600 truncate">
                  {review.author.username || `@${review.author.name.toLowerCase().replace(/\s+/g, '_')}`}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-slate-600 truncate font-medium">{review.author.name}</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="truncate text-slate-400 text-[11px]">{review.author.college}</span>
              </div>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleBookmark}
            aria-label="Bookmark project"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors shrink-0"
          >
            <Bookmark
              className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`}
            />
          </button>
        </div>

        {/* Second Row: Language label + Difficulty level + Code Scope (LOC) */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="px-2 py-0.5 rounded-md font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 text-[11px]">
            {review.language}
          </span>
          <span className={`px-2 py-0.5 rounded-md font-semibold border text-[11px] ${difficultyStyles}`}>
            {review.difficulty}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-slate-600 font-mono text-[11px]">
            {review.loc} LOC
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-slate-500 text-[11px]">{review.reviewType}</span>
        </div>

        {/* Third Row: Short Project Description */}
        <p className="mt-2.5 text-xs text-slate-600 leading-relaxed line-clamp-2">
          {review.description}
        </p>

        {/* Fourth Row: Relevant Technology Tags */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {review.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              onClick={e => {
                if (onSelectTag) {
                  e.stopPropagation();
                  onSelectTag(tag);
                }
              }}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 transition-colors"
            >
              {tag}
            </span>
          ))}
          {review.tags.length > 4 && (
            <span className="text-[11px] text-slate-400 font-medium">
              +{review.tags.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Fifth Row: Footer with Status Badge, Number of Comments, and Inspect Code Button */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        {/* Status Badge & Comments Count */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${statusStyles}`}
          >
            {review.status}
          </span>

          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700 font-mono">
              {review.comments.length}
            </span>
            <span className="text-[11px] text-slate-400">
              {review.comments.length === 1 ? 'comment' : 'comments'}
            </span>
          </div>
        </div>

        {/* Action Button: Inspect / View Code */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Posted {formatTimeAgo(review.createdAt)}
          </span>
          <button
            onClick={() => onOpenDetails(review)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5 group/btn shadow-2xs"
          >
            <span>View Code</span>
            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </article>
  );
};
