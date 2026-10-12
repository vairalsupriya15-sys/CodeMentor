import mongoose, { Schema, Document } from 'mongoose';

// User Interface & Schema
export interface IUser extends Document {
  id: string; // custom id like 'usr_1' for backwards-compatible API contracts
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  college: string;
  avatar: string;
  reputation: number;
  reviewsCount: number;
  submissionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      default: 'Computer Science Student',
    },
    college: {
      type: String,
      default: 'Engineering College',
    },
    avatar: {
      type: String,
      default: 'ST',
    },
    reputation: {
      type: Number,
      default: 100,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    submissionsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Comment Subdocument Interface & Schema
export interface IComment {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar: string;
    role: string;
    reputation: number;
  };
  content: string;
  lineNumber?: number;
  type: 'general' | 'line_comment' | 'suggestion' | 'approval' | 'changes_requested';
  createdAt: string;
}

const CommentSchema = new Schema<IComment>(
  {
    id: {
      type: String,
      required: true,
    },
    author: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      username: { type: String, required: true },
      email: { type: String, required: true },
      avatar: { type: String, default: 'ST' },
      role: { type: String, default: 'Student' },
      reputation: { type: Number, default: 100 },
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
    },
    lineNumber: {
      type: Number,
      required: false,
    },
    type: {
      type: String,
      enum: ['general', 'line_comment', 'suggestion', 'approval', 'changes_requested'],
      default: 'general',
    },
    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  { _id: false }
);

// Review Interface & Schema
export interface IReview extends Document {
  id: string; // custom id like 'rev_201' for backwards-compatible API contracts
  title: string;
  description: string;
  language: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  reviewType: 'Course Assignment' | 'Mini Project' | 'Lab Practical' | 'Final Year Project' | 'Clean Code';
  status: 'Open' | 'In Review' | 'Completed' | 'Closed';
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
  comments: IComment[];
  likes: string[]; // array of user IDs
  bookmarks: string[]; // array of user IDs
  rating: number;
  createdAt: string;
  updatedAt: string;
}

const ReviewSchema = new Schema<IReview>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    reviewType: {
      type: String,
      enum: ['Course Assignment', 'Mini Project', 'Lab Practical', 'Final Year Project', 'Clean Code'],
      default: 'Course Assignment',
    },
    status: {
      type: String,
      enum: ['Open', 'In Review', 'Completed', 'Closed'],
      default: 'Open',
      index: true,
    },
    loc: {
      type: Number,
      default: 1,
    },
    author: {
      id: { type: String, required: true, index: true },
      name: { type: String, required: true },
      username: { type: String, required: true },
      email: { type: String, required: true },
      college: { type: String, default: 'Engineering College' },
      avatar: { type: String, default: 'ST' },
      role: { type: String, default: 'Student' },
    },
    code: {
      type: String,
      required: [true, 'Code is required'],
    },
    repositoryUrl: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    comments: {
      type: [CommentSchema],
      default: [],
    },
    likes: {
      type: [String],
      default: [],
    },
    bookmarks: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
    updatedAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    timestamps: false, // We preserve explicit createdAt/updatedAt string timestamps for frontend compatibility
  }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const ReviewModel = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
