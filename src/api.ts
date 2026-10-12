import { CodeReview, Comment, PlatformStats, User, ReviewStatus } from './types';

const TOKEN_KEY = 'codementor_auth_token';

export const api = {
  // Token management
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.warn('Could not save auth token to localStorage:', e);
    }
  },

  clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Could not clear auth token:', e);
    }
  },

  getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // 1. Current Authenticated User
  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    const endpoint = token ? '/api/auth/me' : '/api/users/current';
    const res = await fetch(endpoint, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      // Fallback to demo current user if token expired
      if (res.status === 401 && token) {
        this.clearToken();
        const fallbackRes = await fetch('/api/users/current');
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          return fallbackData.user || fallbackData;
        }
      }
      throw new Error(`Failed to fetch current user (${res.status})`);
    }

    const data = await res.json();
    return data.user || data;
  },

  // 2. All Users / Mentors (for Leaderboard & Demo Persona Switch)
  async getAllUsers(): Promise<User[]> {
    const res = await fetch('/api/users', {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch users list');
    const data = await res.json();
    return Array.isArray(data) ? data : data.users || [];
  },

  // 3. Real User Registration (with bcrypt hash on backend)
  async register(userData: {
    name: string;
    username: string;
    email: string;
    password: string;
    college?: string;
    role?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Registration failed. Please check form inputs.');
    }

    if (data.token) {
      this.setToken(data.token);
    }
    return { user: data.user, token: data.token };
  },

  // 4. Real User Login (verifies password hash on backend)
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Invalid email or password.');
    }

    if (data.token) {
      this.setToken(data.token);
    }
    return { user: data.user, token: data.token };
  },

  // 5. 1-Click Demo Persona Login (issues valid JWT for selected student)
  async demoLogin(userId: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      // Fallback to switch-user if demo-login unavailable
      const fallback = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (fallback.ok) {
        const u = await fallback.json();
        return { user: u, token: '' };
      }
      throw new Error(data.error || 'Failed to switch demo persona');
    }

    if (data.token) {
      this.setToken(data.token);
    }
    return { user: data.user, token: data.token };
  },

  // Backward compatible login helper
  async switchUser(userId: string): Promise<User> {
    const result = await this.demoLogin(userId);
    return result.user;
  },

  // 6. Platform Statistics
  async getStats(): Promise<PlatformStats> {
    const res = await fetch('/api/stats', {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load platform statistics');
    return res.json();
  },

  // 7. Get Code Reviews (with Search, Language, Status, Difficulty filters)
  async getReviews(params?: {
    search?: string;
    language?: string;
    status?: string;
    difficulty?: string;
    reviewType?: string;
    sort?: string;
  }): Promise<CodeReview[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.language && params.language !== 'All') query.set('language', params.language);
    if (params?.status && params.status !== 'All') query.set('status', params.status);
    if (params?.difficulty && params.difficulty !== 'All') query.set('difficulty', params.difficulty);
    if (params?.reviewType && params.reviewType !== 'All') query.set('reviewType', params.reviewType);
    if (params?.sort) query.set('sort', params.sort);

    const url = `/api/reviews${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!res.ok) throw new Error('Failed to load review projects');
    const data = await res.json();
    return Array.isArray(data) ? data : data.reviews || [];
  },

  // 8. Get Single Review by ID
  async getReviewById(id: string): Promise<CodeReview> {
    const res = await fetch(`/api/reviews/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load review details');
    const data = await res.json();
    return data.review || data;
  },

  // 9. Create New Review Submission
  async createReview(data: {
    title: string;
    description: string;
    language: string;
    difficulty: string;
    reviewType: string;
    code: string;
    repositoryUrl?: string;
    tags: string[];
  }): Promise<CodeReview> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error || 'Failed to submit code review');
    }
    return body.review || body;
  },

  // 10. Update Review Status (Open, In Review, Completed, Closed)
  async updateReviewStatus(id: string, status: ReviewStatus): Promise<CodeReview> {
    const res = await fetch(`/api/reviews/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error || 'Failed to update review status');
    }
    return body.review || body;
  },

  // 11. Delete Review (Owner only)
  async deleteReview(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/reviews/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error || 'Failed to delete review');
    }
    return body;
  },

  // 12. Add Line Comment or Peer Feedback
  async addComment(id: string, commentData: {
    content: string;
    lineNumber?: number;
    type: 'general' | 'line_comment' | 'suggestion' | 'approval' | 'changes_requested';
  }): Promise<{ review: CodeReview; comment: Comment }> {
    const res = await fetch(`/api/reviews/${id}/comments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(commentData),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error || 'Failed to add peer feedback comment');
    }
    return {
      review: body.review || body,
      comment: body.comment || body,
    };
  },

  // 13. Delete Comment (Author only)
  async deleteComment(reviewId: string, commentId: string): Promise<CodeReview> {
    const res = await fetch(`/api/reviews/${reviewId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error || 'Failed to delete comment');
    }
    return body.review || body;
  },

  // 14. Toggle Like / Upvote
  async toggleLike(id: string): Promise<{ likesCount: number; isLiked: boolean }> {
    const res = await fetch(`/api/reviews/${id}/like`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      // Backward compatible fallback
      const fallback = await fetch(`/api/reviews/${id}/toggle-like`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      if (fallback.ok) return fallback.json();
      throw new Error('Failed to toggle like');
    }
    return res.json();
  },

  // 15. Toggle Bookmark
  async toggleBookmark(id: string): Promise<{ bookmarksCount: number; isBookmarked: boolean }> {
    const res = await fetch(`/api/reviews/${id}/bookmark`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      // Backward compatible fallback
      const fallback = await fetch(`/api/reviews/${id}/toggle-bookmark`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      if (fallback.ok) return fallback.json();
      throw new Error('Failed to toggle bookmark');
    }
    return res.json();
  },
};
