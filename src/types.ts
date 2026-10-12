export interface User {
  id: string;
  name: string;
  username: string; // e.g. @supriya_v, @rohit_cs
  email: string;
  role: string; // e.g. "Computer Science (4th Year)", "Peer Mentor", "IT Student"
  college: string; // e.g. "Tech Institute of Computer Science"
  avatar: string;
  reputation: number;
  reviewsCount: number;
  submissionsCount: number;
}

export type ReviewStatus = 'Open' | 'In Review' | 'Completed' | 'Closed';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type ReviewCategory = 'Course Assignment' | 'Mini Project' | 'Lab Practical' | 'Final Year Project' | 'Clean Code';

export interface CommentAuthor {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
  reputation: number;
}

export interface Comment {
  id: string;
  author: CommentAuthor;
  content: string;
  lineNumber?: number;
  type: 'general' | 'line_comment' | 'suggestion' | 'approval' | 'changes_requested';
  createdAt: string;
}

export interface CodeReview {
  id: string;
  title: string;
  description: string;
  language: string; // e.g. 'Java', 'React', 'Python', 'JavaScript', 'MERN Stack', 'C++'
  difficulty: DifficultyLevel;
  reviewType: ReviewCategory;
  status: ReviewStatus;
  loc: number;
  author: {
    id: string;
    name: string;
    username: string;
    email: string;
    college: string;
    avatar: string;
    role: string;
  };
  code: string;
  repositoryUrl?: string;
  tags: string[];
  comments: Comment[];
  likesCount: number;
  bookmarksCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformStats {
  totalSubmissions: number;
  openCount: number;
  inReviewCount: number;
  completedCount: number;
  totalComments: number;
  activeMentors: number;
  avgTurnaroundTime: string;
  satisfactionRate: string;
}

export interface FilterState {
  search: string;
  category: string;
  reviewTypes: string[];
  difficulty: string;
  maxLoc: number;
  statuses: string[];
  language: string;
  sortBy: 'newest' | 'popular' | 'rating' | 'oldest';
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}
