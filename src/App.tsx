import React, { useState, useEffect, useMemo } from 'react';
import { api } from './api';
import { CodeReview, FilterState, PlatformStats, ReviewStatus, User } from './types';
import { INITIAL_USERS, INITIAL_REVIEWS, INITIAL_STATS } from './initialData';
import { Header } from './components/Header';
import { FilterSidebar } from './components/FilterSidebar';
import { HeroBanner } from './components/HeroBanner';
import { ReviewCard } from './components/ReviewCard';
import { CodeReviewModal } from './components/CodeReviewModal';
import { SubmitCodeModal } from './components/SubmitCodeModal';
import { AuthModal } from './components/AuthModal';
import { LeaderboardView } from './components/LeaderboardView';
import { DocsView } from './components/DocsView';
import { StatsModal } from './components/StatsModal';
import { 
  ArrowUpDown, Filter, Plus, Code2, AlertCircle, CheckCircle2, Loader2, RefreshCw
} from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  search: '',
  category: 'All',
  reviewTypes: [],
  difficulty: 'All',
  maxLoc: 400,
  statuses: [],
  language: 'All',
  sortBy: 'newest',
};

export default function App() {
  // 1. Core State with robust initial fallbacks
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [reviews, setReviews] = useState<CodeReview[]>(INITIAL_REVIEWS);
  const [stats, setStats] = useState<PlatformStats>(INITIAL_STATS);

  // Loading & Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 2. Navigation tabs: 'explore' | 'my_reviews' | 'leaderboard' | 'docs'
  const [activeTab, setActiveTab] = useState<'explore' | 'my_reviews' | 'leaderboard' | 'docs'>('explore');

  // 3. Modals
  const [selectedReview, setSelectedReview] = useState<CodeReview | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // 4. Filters State
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Toast notification helper
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // 5. Backend Data Synchronization
  const syncWithBackend = async () => {
    try {
      setIsLoading(true);
      const [userData, usersData, reviewsData, statsData] = await Promise.all([
        api.getCurrentUser().catch(() => null),
        api.getAllUsers().catch(() => []),
        api.getReviews().catch(() => []),
        api.getStats().catch(() => null),
      ]);

      if (userData) setCurrentUser(userData);
      if (usersData && usersData.length > 0) setAllUsers(usersData);
      if (reviewsData && reviewsData.length > 0) setReviews(reviewsData);
      if (statsData) setStats(statsData);
    } catch (err: any) {
      console.warn('Backend sync error (retaining offline state):', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    syncWithBackend();
  }, []);

  // 6. Filtered & Sorted Reviews Computation
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // "My Submissions" tab: filter strictly to current user's projects
    if (activeTab === 'my_reviews' && currentUser) {
      result = result.filter(
        r => r.author.id === currentUser.id || r.author.username === currentUser.username
      );
    }

    // Search query
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.language.toLowerCase().includes(q) ||
          r.author.name.toLowerCase().includes(q) ||
          (r.author.username && r.author.username.toLowerCase().includes(q)) ||
          r.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Language Filter
    if (filters.language !== 'All') {
      result = result.filter(r => r.language.toLowerCase() === filters.language.toLowerCase());
    }

    // Review Types / Categories
    if (filters.reviewTypes.length > 0) {
      result = result.filter(r => filters.reviewTypes.includes(r.reviewType));
    }

    // Difficulty Level
    if (filters.difficulty !== 'All') {
      result = result.filter(r => r.difficulty === filters.difficulty);
    }

    // Review Status (Open, In Review, Completed, Closed)
    if (filters.statuses.length > 0) {
      result = result.filter(r => filters.statuses.includes(r.status));
    }

    // Lines of Code Scope
    result = result.filter(r => r.loc <= filters.maxLoc);

    // Sorting
    if (filters.sortBy === 'popular') {
      result.sort((a, b) => b.likesCount - a.likesCount);
    } else if (filters.sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [reviews, filters, activeTab, currentUser]);

  // 7. Handlers & Actions
  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Status Change
  const handleUpdateStatus = async (newStatus: ReviewStatus) => {
    if (!selectedReview) return;

    const previousStatus = selectedReview.status;
    const updatedReview: CodeReview = {
      ...selectedReview,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setSelectedReview(updatedReview);
    setReviews(prev => prev.map(r => (r.id === updatedReview.id ? updatedReview : r)));
    setStats(prev => ({
      ...prev,
      openCount: prev.openCount + (newStatus === 'Open' ? 1 : previousStatus === 'Open' ? -1 : 0),
      inReviewCount: prev.inReviewCount + (newStatus === 'In Review' ? 1 : previousStatus === 'In Review' ? -1 : 0),
      completedCount: prev.completedCount + (newStatus === 'Completed' ? 1 : previousStatus === 'Completed' ? -1 : 0),
    }));

    try {
      const serverUpdated = await api.updateReviewStatus(selectedReview.id, newStatus);
      if (serverUpdated) {
        setSelectedReview(serverUpdated);
        setReviews(prev => prev.map(r => (r.id === serverUpdated.id ? serverUpdated : r)));
      }
      showNotification(`Review status updated to "${newStatus}"`, 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to update review status on server', 'error');
    }
  };

  // Add Comment / Peer Feedback
  const handleAddComment = async (commentData: {
    content: string;
    lineNumber?: number;
    type: 'general' | 'line_comment' | 'suggestion' | 'approval' | 'changes_requested';
  }) => {
    if (!selectedReview) return;

    const newComment = {
      id: `c_${Date.now()}`,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        email: currentUser.email,
        avatar: currentUser.avatar,
        role: currentUser.role,
        reputation: currentUser.reputation,
      },
      content: commentData.content,
      lineNumber: commentData.lineNumber,
      type: commentData.type,
      createdAt: new Date().toISOString(),
    };

    const nextStatus = 
      selectedReview.status === 'Open' ? 'In Review' : 
      commentData.type === 'approval' ? 'Completed' : 
      selectedReview.status;

    const updatedReview: CodeReview = {
      ...selectedReview,
      status: nextStatus as ReviewStatus,
      comments: [...selectedReview.comments, newComment],
      reviewCount: selectedReview.comments.length + 1,
      updatedAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setSelectedReview(updatedReview);
    setReviews(prev => prev.map(r => (r.id === updatedReview.id ? updatedReview : r)));
    setCurrentUser(prev => ({ ...prev, reputation: prev.reputation + 15, reviewsCount: prev.reviewsCount + 1 }));
    setStats(prev => ({ ...prev, totalComments: prev.totalComments + 1 }));

    try {
      const res = await api.addComment(selectedReview.id, commentData);
      if (res?.review) {
        setSelectedReview(res.review);
        setReviews(prev => prev.map(r => (r.id === res.review.id ? res.review : r)));
      }
      showNotification('Peer feedback comment added successfully!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Error posting feedback comment', 'error');
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!selectedReview) return;

    const filteredComments = selectedReview.comments.filter(c => c.id !== commentId);
    const updated = { ...selectedReview, comments: filteredComments, reviewCount: filteredComments.length };
    setSelectedReview(updated);
    setReviews(prev => prev.map(r => (r.id === updated.id ? updated : r)));

    try {
      const res = await api.deleteComment(selectedReview.id, commentId);
      if (res) {
        setSelectedReview(res);
        setReviews(prev => prev.map(r => (r.id === res.id ? res : r)));
      }
      showNotification('Comment deleted successfully', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete comment', 'error');
    }
  };

  // Delete Review
  const handleDeleteReview = async (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    if (selectedReview?.id === reviewId) setSelectedReview(null);

    try {
      await api.deleteReview(reviewId);
      showNotification('Project review deleted', 'success');
      syncWithBackend();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete review', 'error');
    }
  };

  // Toggle Upvote / Like
  const handleToggleLike = async () => {
    if (!selectedReview) return;
    const isCurrentlyLiked = selectedReview.isLiked ?? false;
    const nextLiked = !isCurrentlyLiked;
    const newLikes = Math.max(0, selectedReview.likesCount + (nextLiked ? 1 : -1));

    const updated = { ...selectedReview, likesCount: newLikes, isLiked: nextLiked };
    setSelectedReview(updated);
    setReviews(prev => prev.map(r => (r.id === selectedReview.id ? updated : r)));

    try {
      const res = await api.toggleLike(selectedReview.id);
      if (res) {
        const synced = { ...selectedReview, likesCount: res.likesCount, isLiked: res.isLiked };
        setSelectedReview(synced);
        setReviews(prev => prev.map(r => (r.id === selectedReview.id ? synced : r)));
      }
    } catch (err: any) {
      console.warn('Like toggle failed:', err);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = async (id: string) => {
    setReviews(prev =>
      prev.map(r => {
        if (r.id === id) {
          const isB = !r.isBookmarked;
          return {
            ...r,
            isBookmarked: isB,
            bookmarksCount: Math.max(0, r.bookmarksCount + (isB ? 1 : -1)),
          };
        }
        return r;
      })
    );

    if (selectedReview?.id === id) {
      const isB = !selectedReview.isBookmarked;
      setSelectedReview({
        ...selectedReview,
        isBookmarked: isB,
        bookmarksCount: Math.max(0, selectedReview.bookmarksCount + (isB ? 1 : -1)),
      });
    }

    try {
      await api.toggleBookmark(id);
    } catch (err: any) {
      console.warn('Bookmark toggle failed:', err);
    }
  };

  // Create Review Submission
  const handleCreateReview = async (data: any) => {
    const loc = data.code.split('\n').filter((l: string) => l.trim().length > 0).length || 1;
    const tempRev: CodeReview = {
      id: `rev_${Date.now()}`,
      title: data.title,
      description: data.description || 'College project submitted for peer inspection.',
      language: data.language || 'Java',
      difficulty: data.difficulty || 'Beginner',
      reviewType: data.reviewType || 'Course Assignment',
      status: 'Open',
      loc,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        email: currentUser.email,
        college: currentUser.college,
        avatar: currentUser.avatar,
        role: currentUser.role,
      },
      code: data.code,
      repositoryUrl: data.repositoryUrl || '',
      tags: data.tags || [data.language],
      comments: [],
      likesCount: 1,
      bookmarksCount: 0,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistically update
    setReviews(prev => [tempRev, ...prev]);
    setCurrentUser(prev => ({ ...prev, submissionsCount: prev.submissionsCount + 1 }));
    setStats(prev => ({ ...prev, totalSubmissions: prev.totalSubmissions + 1, openCount: prev.openCount + 1 }));
    setSelectedReview(tempRev);
    setIsSubmitModalOpen(false);

    try {
      const created = await api.createReview(data);
      if (created) {
        setReviews(prev => [created, ...prev.filter(r => r.id !== tempRev.id)]);
        setSelectedReview(created);
      }
      showNotification('Project code submitted for peer review!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Error submitting review to backend', 'error');
    }
  };

  // Demo Switch Persona
  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await api.demoLogin(userId);
      setCurrentUser(res.user);
      showNotification(`Switched persona to ${res.user.name} (${res.user.username})`, 'success');
      syncWithBackend();
    } catch (err: any) {
      const fallback = allUsers.find(u => u.id === userId);
      if (fallback) setCurrentUser(fallback);
      showNotification(err.message || 'Persona switched', 'success');
    }
  };

  // Real Login with Password
  const handleLogin = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setCurrentUser(res.user);
    showNotification(`Welcome back, ${res.user.name}!`, 'success');
    syncWithBackend();
  };

  // Real Registration
  const handleRegister = async (data: any) => {
    const res = await api.register(data);
    setCurrentUser(res.user);
    setAllUsers(prev => [res.user, ...prev]);
    showNotification(`Student account registered for ${res.user.name}!`, 'success');
    syncWithBackend();
  };

  // Logout
  const handleLogout = () => {
    api.clearToken();
    const defaultUser = INITIAL_USERS[0];
    setCurrentUser(defaultUser);
    showNotification('Signed out. Switched to demo guest profile.', 'success');
    setIsAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm animate-in slide-in-from-top-2 fade-in">
          <div
            className={`p-3.5 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-medium ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="flex-1">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 ml-1 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 1. Top Navigation Bar (Dokarti style) */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenStatsModal={() => setIsStatsModalOpen(true)}
        stats={stats}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* View Tab Routing */}
        {activeTab === 'leaderboard' ? (
          <LeaderboardView
            users={allUsers}
            stats={stats}
            onOpenSubmit={() => setIsSubmitModalOpen(true)}
          />
        ) : activeTab === 'docs' ? (
          <DocsView />
        ) : (
          /* Two-Column Dokarti Layout: Left Filter Sidebar + Right Project Feed */
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden w-full flex items-center justify-between pb-2">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs"
              >
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>{mobileFilterOpen ? 'Hide Filters' : 'Filter Projects'}</span>
                <span className="font-mono text-slate-400">({filteredReviews.length})</span>
              </button>

              <select
                value={filters.sortBy}
                onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Upvoted</option>
                <option value="rating">Top Rated</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>

            {/* Left Sidebar (Desktop: always visible, Mobile: toggled) */}
            <div className={`w-full lg:w-72 xl:w-80 shrink-0 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-24">
                <FilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  onReset={handleResetFilters}
                  totalMatches={filteredReviews.length}
                />
              </div>
            </div>

            {/* Right Feed Area */}
            <div className="flex-1 min-w-0 w-full space-y-6">
              {/* Hero Banner with Search Bar */}
              {activeTab === 'explore' && (
                <HeroBanner
                  searchQuery={filters.search}
                  setSearchQuery={q => setFilters(prev => ({ ...prev, search: q }))}
                  onSearchSubmit={handleSearchSubmit}
                  activeLanguage={filters.language}
                  onSelectLanguage={lang => setFilters(prev => ({ ...prev, language: lang }))}
                />
              )}

              {activeTab === 'my_reviews' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                  <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      My Project Submissions
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Manage and track review feedback for projects submitted by {currentUser?.name} ({currentUser?.username}).
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Submit New Project</span>
                  </button>
                </div>
              )}

              {/* Feed Header: Showing counts + Sort dropdown + Quick status chips */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">
                    {activeTab === 'my_reviews' ? 'Your Submitted Projects' : 'College Programming Projects'}
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">
                    ({filteredReviews.length} available)
                  </span>
                  {isLoading && (
                    <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin ml-1" />
                  )}
                </div>

                {/* Quick Status pills & Sort */}
                <div className="flex items-center gap-3">
                  {/* Status quick toggle pills */}
                  <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, statuses: [] }))}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        filters.statuses.length === 0 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, statuses: ['Open'] }))}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        filters.statuses.length === 1 && filters.statuses[0] === 'Open' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, statuses: ['In Review'] }))}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        filters.statuses.length === 1 && filters.statuses[0] === 'In Review' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      In Review
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, statuses: ['Completed'] }))}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        filters.statuses.length === 1 && filters.statuses[0] === 'Completed' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Completed
                    </button>
                  </div>

                  {/* Desktop Sort Dropdown */}
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={filters.sortBy}
                      onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                      className="bg-transparent font-semibold text-slate-700 hover:text-slate-900 focus:outline-none cursor-pointer"
                    >
                      <option value="newest">Newest First</option>
                      <option value="popular">Most Upvoted</option>
                      <option value="rating">Top Rated</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2-Column Grid of Review Cards */}
              {filteredReviews.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">No student projects match your filters</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try adjusting your language, scope, or difficulty criteria, or submit a new college project.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                    >
                      Reset Filters
                    </button>
                    <button
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
                    >
                      Submit Project
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {filteredReviews.map(review => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onOpenDetails={setSelectedReview}
                      onToggleBookmark={handleToggleBookmark}
                      onSelectTag={tag => setFilters(prev => ({ ...prev, search: tag }))}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">CodeMentor</span>
            <span>·</span>
            <span>College Peer Code Review Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Java · Python · React · JavaScript · MySQL · MERN</span>
            <span>·</span>
            <span className="text-slate-600 font-medium">Undergraduate CS Portfolio Ready</span>
          </div>
        </div>
      </footer>

      {/* --- Modals --- */}
      {selectedReview && (
        <CodeReviewModal
          review={selectedReview}
          currentUser={currentUser}
          onClose={() => setSelectedReview(null)}
          onUpdateStatus={handleUpdateStatus}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onDeleteReview={handleDeleteReview}
          onToggleLike={handleToggleLike}
          onToggleBookmark={handleToggleBookmark}
        />
      )}

      {isSubmitModalOpen && (
        <SubmitCodeModal
          onClose={() => setIsSubmitModalOpen(false)}
          onSubmit={handleCreateReview}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          currentUser={currentUser}
          allUsers={allUsers}
          onClose={() => setIsAuthModalOpen(false)}
          onSwitchUser={handleSwitchUser}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onLogout={handleLogout}
        />
      )}

      {isStatsModalOpen && (
        <StatsModal
          stats={stats}
          onClose={() => setIsStatsModalOpen(false)}
        />
      )}
    </div>
  );
}
