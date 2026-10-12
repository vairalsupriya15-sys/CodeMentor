import React, { useState, useRef } from 'react';
import { CodeReview, Comment, ReviewStatus, User } from '../types';
import { 
  X, ExternalLink, 
  MessageSquare, Send,
  ChevronDown, Check, Code, Sparkles, CornerDownRight,
  ThumbsUp, Bookmark, Copy, CheckCheck, Trash2, Shield
} from 'lucide-react';

interface CodeReviewModalProps {
  review: CodeReview;
  currentUser?: User | null;
  onClose: () => void;
  onUpdateStatus: (newStatus: ReviewStatus) => Promise<void>;
  onAddComment: (commentData: {
    content: string;
    lineNumber?: number;
    type: 'general' | 'line_comment' | 'suggestion' | 'approval' | 'changes_requested';
  }) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onDeleteReview?: (reviewId: string) => Promise<void>;
  onToggleLike: () => void;
  onToggleBookmark?: (id: string) => void;
}

export const CodeReviewModal: React.FC<CodeReviewModalProps> = ({
  review,
  currentUser,
  onClose,
  onUpdateStatus,
  onAddComment,
  onDeleteComment,
  onDeleteReview,
  onToggleLike,
  onToggleBookmark,
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'discussion' | 'overview'>('code');
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Comment Form state
  const [newComment, setNewComment] = useState('');
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [commentType, setCommentType] = useState<'suggestion' | 'general' | 'approval' | 'changes_requested'>('suggestion');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [isDeletingReview, setIsDeletingReview] = useState(false);

  const codeLines = review.code.split('\n');
  const codeContainerRef = useRef<HTMLDivElement>(null);

  // Map comments by line number
  const commentsByLine = review.comments.reduce((acc, c) => {
    if (c.lineNumber !== undefined) {
      if (!acc[c.lineNumber]) acc[c.lineNumber] = [];
      acc[c.lineNumber].push(c);
    }
    return acc;
  }, {} as Record<number, Comment[]>);

  const handleStatusChange = async (newStatus: ReviewStatus) => {
    setIsUpdatingStatus(true);
    setStatusMenuOpen(false);
    try {
      await onUpdateStatus(newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(review.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      await onAddComment({
        content: newComment.trim(),
        lineNumber: selectedLine ?? undefined,
        type: commentType,
      });
      setNewComment('');
      setSelectedLine(null);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteCommentClick = async (commentId: string) => {
    if (!onDeleteComment) return;
    setDeletingCommentId(commentId);
    try {
      await onDeleteComment(commentId);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleDeleteReviewClick = async () => {
    if (!onDeleteReview) return;
    if (!window.confirm('Are you sure you want to delete this project review submission?')) return;
    setIsDeletingReview(true);
    try {
      await onDeleteReview(review.id);
      onClose();
    } finally {
      setIsDeletingReview(false);
    }
  };

  const scrollToLine = (lineNumber: number) => {
    setActiveTab('code');
    setSelectedLine(lineNumber);
    const el = document.getElementById(`code-line-${lineNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const statusColorMap = {
    'Open': 'bg-emerald-50 text-emerald-700 border-emerald-300',
    'In Review': 'bg-amber-50 text-amber-700 border-amber-300',
    'Completed': 'bg-blue-50 text-blue-700 border-blue-300',
    'Closed': 'bg-slate-100 text-slate-700 border-slate-300',
  }[review.status] || 'bg-slate-100 text-slate-700 border-slate-300';

  const isReviewOwner = currentUser && (currentUser.id === review.author.id || currentUser.username === review.author.username);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden text-slate-800"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-200/80 bg-slate-50/70 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {/* Language pill */}
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100/80 text-blue-800">
                  {review.language}
                </span>
                <span className="text-xs text-slate-500 font-medium">·</span>
                <span className="text-xs font-semibold text-slate-600">
                  {review.difficulty}
                </span>
                <span className="text-xs text-slate-500 font-medium">·</span>
                <span className="text-xs font-mono font-medium text-slate-500">
                  {review.loc} LOC
                </span>
                {review.repositoryUrl && (
                  <a
                    href={review.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                  >
                    <span>Repo</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {review.title}
              </h2>

              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
                <span className="font-semibold text-blue-600">
                  {review.author.username || `@${review.author.name.toLowerCase().replace(/\s+/g, '_')}`}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="font-medium text-slate-700">{review.author.name}</span>
                <span className="text-slate-400">({review.author.college})</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>Submitted {new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions & Status Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Status Switcher Button */}
              <div className="relative">
                <button
                  onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                  disabled={isUpdatingStatus}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${statusColorMap}`}
                  title="Update review status"
                >
                  <span>{review.status}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {statusMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 animate-in fade-in slide-from-top-1">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Set Review Status
                    </div>
                    {(['Open', 'In Review', 'Completed', 'Closed'] as ReviewStatus[]).map(st => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          review.status === st ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                        }`}
                      >
                        <span>{st}</span>
                        {review.status === st && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Upvote Button */}
              <button
                onClick={onToggleLike}
                className={`p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1 text-xs font-medium ${
                  review.isLiked ? 'text-blue-600 bg-blue-50/60 border-blue-300' : 'text-slate-600 bg-white'
                }`}
                title="Upvote project"
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${review.isLiked ? 'fill-blue-600' : ''}`} />
                <span className="font-mono">{review.likesCount}</span>
              </button>

              {/* Bookmark Button */}
              {onToggleBookmark && (
                <button
                  onClick={() => onToggleBookmark(review.id)}
                  className={`p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1 text-xs font-medium ${
                    review.isBookmarked ? 'text-blue-600 bg-blue-50/60 border-blue-300' : 'text-slate-600 bg-white'
                  }`}
                  title="Bookmark project"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${review.isBookmarked ? 'fill-blue-600' : ''}`} />
                </button>
              )}

              {/* Owner Delete Review Button */}
              {isReviewOwner && onDeleteReview && (
                <button
                  onClick={handleDeleteReviewClick}
                  disabled={isDeletingReview}
                  className="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                  title="Delete this project review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'code'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Source Code</span>
                <span className="font-mono text-[11px] opacity-80">({review.loc}L)</span>
              </button>
              <button
                onClick={() => setActiveTab('discussion')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'discussion'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Peer Review Feedback</span>
                <span className="font-mono text-[11px] opacity-80">({review.comments.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Assignment Context</span>
              </button>
            </div>

            {/* Copy Code Button */}
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Copy snippet code"
            >
              {copiedCode ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Code Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 space-y-6">
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">Reviewer Tip:</span>
                  <span>Click on any line number to target your review comment directly to that line.</span>
                </div>
                {selectedLine && (
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold font-mono">
                      Target: Line {selectedLine}
                    </span>
                    <button
                      onClick={() => setSelectedLine(null)}
                      className="text-slate-400 hover:text-slate-600 text-[11px] underline"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Code Viewer Container */}
              <div 
                ref={codeContainerRef}
                className="rounded-xl border border-slate-800 bg-[#0F172A] text-slate-200 overflow-x-auto shadow-md font-mono text-xs leading-relaxed"
              >
                <div className="bg-[#1E293B] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{review.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.{review.language.toLowerCase().includes('java') && !review.language.toLowerCase().includes('script') ? 'java' : review.language.toLowerCase().includes('python') ? 'py' : review.language.toLowerCase().includes('react') ? 'jsx' : 'js'}</span>
                  <span>UTF-8 · College Submission · {review.loc} LOC</span>
                </div>

                <div className="py-2">
                  {codeLines.map((line, idx) => {
                    const lineNum = idx + 1;
                    const hasComments = commentsByLine[lineNum]?.length > 0;
                    const isSelected = selectedLine === lineNum;

                    return (
                      <div key={lineNum}>
                        <div
                          id={`code-line-${lineNum}`}
                          onClick={() => setSelectedLine(lineNum)}
                          className={`flex items-stretch hover:bg-slate-800/80 cursor-pointer transition-colors group ${
                            isSelected ? 'bg-blue-950/70 border-l-2 border-blue-500' : ''
                          }`}
                        >
                          {/* Gutter / Line Number */}
                          <div className="w-12 px-2 text-right select-none text-slate-500 font-mono text-[11px] flex items-center justify-end gap-1 shrink-0 bg-slate-900/60 border-r border-slate-800/80">
                            {hasComments && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Has peer comment" />
                            )}
                            <span className="group-hover:text-blue-400">{lineNum}</span>
                          </div>

                          {/* Code Content */}
                          <div className="px-4 py-0.5 whitespace-pre font-mono text-slate-100 flex-1 overflow-x-auto">
                            {line || ' '}
                          </div>
                        </div>

                        {/* Inline Comments directly under the line */}
                        {hasComments && (
                          <div className="bg-slate-900/90 border-y border-amber-500/30 px-12 py-2.5 my-1 space-y-2">
                            {commentsByLine[lineNum].map(comment => (
                              <div key={comment.id} className="text-xs bg-slate-800/90 rounded-lg p-2.5 border border-slate-700/80">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-amber-300">{comment.author.name}</span>
                                    <span className="text-[10px] text-blue-300 font-mono">{comment.author.username}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-slate-400">
                                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {currentUser && (currentUser.id === comment.author.id || currentUser.username === comment.author.username) && onDeleteComment && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteCommentClick(comment.id);
                                        }}
                                        disabled={deletingCommentId === comment.id}
                                        className="text-rose-400 hover:text-rose-300 p-0.5"
                                        title="Delete your comment"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-slate-200 text-xs font-sans leading-relaxed">
                                  {comment.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'discussion' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Peer Feedback Thread ({review.comments.length})
                </h3>
              </div>

              {review.comments.length === 0 ? (
                <div className="bg-white rounded-xl p-8 border border-slate-200 text-center">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No review comments yet</p>
                  <p className="text-xs text-slate-400 mt-1">Be the first peer to help this student review their assignment!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {review.comments.map(c => {
                    const badgeStyles = {
                      'suggestion': 'bg-blue-50 text-blue-700 border-blue-200',
                      'approval': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      'changes_requested': 'bg-rose-50 text-rose-700 border-rose-200',
                      'line_comment': 'bg-amber-50 text-amber-700 border-amber-200',
                      'general': 'bg-slate-100 text-slate-700 border-slate-200',
                    }[c.type] || 'bg-slate-100 text-slate-700 border-slate-200';

                    const isCommentAuthor = currentUser && (currentUser.id === c.author.id || currentUser.username === c.author.username);

                    return (
                      <div key={c.id} className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-slate-700 to-indigo-900 text-white flex items-center justify-center font-bold text-xs">
                              {c.author.avatar}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{c.author.name}</span>
                                <span className="text-blue-600 font-mono text-[11px] font-semibold">{c.author.username}</span>
                                <span className="text-[10px] font-normal text-slate-400 hidden sm:inline">· {c.author.role}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Reputation: ★ {c.author.reputation} pts
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {c.lineNumber && (
                              <button
                                onClick={() => scrollToLine(c.lineNumber!)}
                                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-blue-600 hover:bg-blue-50 border border-slate-200 flex items-center gap-1 transition-colors"
                              >
                                <span>Line {c.lineNumber}</span>
                                <CornerDownRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeStyles}`}>
                              {c.type.replace('_', ' ')}
                            </span>
                            {isCommentAuthor && onDeleteComment && (
                              <button
                                onClick={() => handleDeleteCommentClick(c.id)}
                                disabled={deletingCommentId === c.id}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete your comment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-sans pl-9">
                          {c.content}
                        </p>

                        <div className="text-right text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="bg-white rounded-xl p-6 border border-slate-200/90 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Assignment Description & Context
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {review.description}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Technologies & Concepts Tested
                </h3>
                <div className="flex flex-wrap gap-2">
                  {review.tags.map(t => (
                    <span key={t} className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-semibold mb-0.5">Student Author</div>
                  <div className="font-bold text-slate-800">{review.author.name}</div>
                  <div className="text-blue-600 font-mono text-[11px] font-semibold">{review.author.username}</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">{review.author.college}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-semibold mb-0.5">Category & Level</div>
                  <div className="font-bold text-slate-800">{review.reviewType}</div>
                  <div className="text-slate-500">{review.difficulty} Level</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-semibold mb-0.5">Status & Discussion</div>
                  <div className="font-bold text-slate-800">{review.status}</div>
                  <div className="text-slate-500">{review.comments.length} peer comments</div>
                </div>
              </div>
            </div>
          )}

          {/* Comment Composer at bottom */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Add Peer Review Feedback</span>
                {selectedLine && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono text-[11px] font-bold rounded-md border border-blue-200">
                    Line {selectedLine}
                  </span>
                )}
              </span>

              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCommentType('suggestion')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    commentType === 'suggestion' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Suggestion
                </button>
                <button
                  type="button"
                  onClick={() => setCommentType('approval')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    commentType === 'approval' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setCommentType('changes_requested')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    commentType === 'changes_requested' ? 'bg-rose-100 text-rose-800 font-bold' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Request Changes
                </button>
              </div>
            </div>

            <form onSubmit={handleCommentSubmit} className="space-y-2">
              <textarea
                rows={2}
                required
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder={selectedLine ? `Write constructive feedback for line ${selectedLine}...` : "Write general constructive peer review feedback or question..."}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none font-sans"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {currentUser ? `Posting as ${currentUser.name} (${currentUser.username})` : 'Posting as reviewer'}
                </span>

                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingComment ? 'Posting...' : 'Post Feedback'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
