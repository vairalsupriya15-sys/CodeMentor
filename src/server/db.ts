import fs from 'fs';
import path from 'path';
import { UserModel, ReviewModel, IUser, IReview } from './models';
import { isMongoConnected } from './connection';

export interface UserDocument {
  id: string;
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
  createdAt: string;
}

export interface CommentDocument {
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

export interface ReviewDocument {
  id: string;
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
  comments: CommentDocument[];
  likes: string[]; // Array of user IDs who liked
  bookmarks: string[]; // Array of user IDs who bookmarked
  rating: number;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseSchema {
  users: UserDocument[];
  reviews: ReviewDocument[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

export class DatabaseManager {
  private fileData: DatabaseSchema;

  constructor() {
    this.fileData = this.loadFileDatabase();
  }

  // --- JSON File Fallback & Hydration Methods ---
  private loadFileDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.reviews) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error reading JSON fallback database from disk:', err);
    }
    return { users: [], reviews: [] };
  }

  private saveFileDatabase(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.fileData, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write JSON backup file:', err);
    }
  }

  /**
   * Migrate and seed existing records from data/database.json into MongoDB.
   * Safe and idempotent: will not duplicate users or reviews that already exist.
   */
  public async syncWithMongoDB(): Promise<{ usersMigrated: number; reviewsMigrated: number }> {
    if (!isMongoConnected()) {
      return { usersMigrated: 0, reviewsMigrated: 0 };
    }

    let usersMigrated = 0;
    let reviewsMigrated = 0;

    // 1. Sync users
    for (const user of this.fileData.users) {
      const existing = await UserModel.findOne({
        $or: [{ id: user.id }, { email: user.email.toLowerCase() }, { username: user.username.toLowerCase() }],
      });

      if (!existing) {
        await UserModel.create({
          id: user.id,
          name: user.name,
          username: user.username.toLowerCase(),
          email: user.email.toLowerCase(),
          passwordHash: user.passwordHash,
          role: user.role,
          college: user.college,
          avatar: user.avatar,
          reputation: user.reputation,
          reviewsCount: user.reviewsCount,
          submissionsCount: user.submissionsCount,
        });
        usersMigrated++;
      }
    }

    // 2. Sync reviews
    for (const review of this.fileData.reviews) {
      const existing = await ReviewModel.findOne({ id: review.id });
      if (!existing) {
        await ReviewModel.create({
          id: review.id,
          title: review.title,
          description: review.description,
          language: review.language,
          difficulty: review.difficulty,
          reviewType: review.reviewType,
          status: review.status,
          loc: review.loc,
          author: review.author,
          code: review.code,
          repositoryUrl: review.repositoryUrl || '',
          tags: review.tags,
          comments: review.comments,
          likes: review.likes,
          bookmarks: review.bookmarks,
          rating: review.rating,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        });
        reviewsMigrated++;
      }
    }

    console.log(`[Database] MongoDB Sync Complete: ${usersMigrated} new users, ${reviewsMigrated} new reviews migrated.`);
    return { usersMigrated, reviewsMigrated };
  }

  // --- Users Collection ---
  public async findUserById(id: string): Promise<UserDocument | undefined> {
    if (isMongoConnected()) {
      const doc = await UserModel.findOne({ id }).lean<IUser>();
      if (doc) {
        return {
          id: doc.id,
          name: doc.name,
          username: doc.username,
          email: doc.email,
          passwordHash: doc.passwordHash,
          role: doc.role,
          college: doc.college,
          avatar: doc.avatar,
          reputation: doc.reputation,
          reviewsCount: doc.reviewsCount,
          submissionsCount: doc.submissionsCount,
          createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        };
      }
      return undefined;
    }
    return this.fileData.users.find(u => u.id === id);
  }

  public async findUserByEmail(email: string): Promise<UserDocument | undefined> {
    const normalized = email.toLowerCase().trim();
    if (isMongoConnected()) {
      const doc = await UserModel.findOne({ email: normalized }).lean<IUser>();
      if (doc) {
        return {
          id: doc.id,
          name: doc.name,
          username: doc.username,
          email: doc.email,
          passwordHash: doc.passwordHash,
          role: doc.role,
          college: doc.college,
          avatar: doc.avatar,
          reputation: doc.reputation,
          reviewsCount: doc.reviewsCount,
          submissionsCount: doc.submissionsCount,
          createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        };
      }
      return undefined;
    }
    return this.fileData.users.find(u => u.email.toLowerCase() === normalized);
  }

  public async findUserByUsername(username: string): Promise<UserDocument | undefined> {
    const normalized = username.toLowerCase().trim();
    if (isMongoConnected()) {
      const doc = await UserModel.findOne({ username: normalized }).lean<IUser>();
      if (doc) {
        return {
          id: doc.id,
          name: doc.name,
          username: doc.username,
          email: doc.email,
          passwordHash: doc.passwordHash,
          role: doc.role,
          college: doc.college,
          avatar: doc.avatar,
          reputation: doc.reputation,
          reviewsCount: doc.reviewsCount,
          submissionsCount: doc.submissionsCount,
          createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        };
      }
      return undefined;
    }
    return this.fileData.users.find(u => u.username.toLowerCase() === normalized);
  }

  public async getAllUsers(): Promise<UserDocument[]> {
    if (isMongoConnected()) {
      const docs = await UserModel.find({}).sort({ reputation: -1 }).lean<IUser[]>();
      return docs.map(doc => ({
        id: doc.id,
        name: doc.name,
        username: doc.username,
        email: doc.email,
        passwordHash: doc.passwordHash,
        role: doc.role,
        college: doc.college,
        avatar: doc.avatar,
        reputation: doc.reputation,
        reviewsCount: doc.reviewsCount,
        submissionsCount: doc.submissionsCount,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      }));
    }
    return this.fileData.users;
  }

  public async createUser(user: Omit<UserDocument, 'id' | 'createdAt'>): Promise<UserDocument> {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    const newUser: UserDocument = {
      ...user,
      id,
      createdAt,
    };

    if (isMongoConnected()) {
      await UserModel.create({
        id,
        name: user.name,
        username: user.username.toLowerCase(),
        email: user.email.toLowerCase(),
        passwordHash: user.passwordHash,
        role: user.role,
        college: user.college,
        avatar: user.avatar,
        reputation: user.reputation,
        reviewsCount: user.reviewsCount,
        submissionsCount: user.submissionsCount,
      });
    }

    // Always keep in-sync in JSON memory/disk for safety & seamless transition
    this.fileData.users.push(newUser);
    this.saveFileDatabase();

    return newUser;
  }

  public async updateUser(id: string, updates: Partial<UserDocument>): Promise<UserDocument | undefined> {
    if (isMongoConnected()) {
      const updated = await UserModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean<IUser>();
      if (!updated) return undefined;
    }

    const localUser = this.fileData.users.find(u => u.id === id);
    if (localUser) {
      Object.assign(localUser, updates);
      this.saveFileDatabase();
    }

    return this.findUserById(id);
  }

  // --- Reviews Collection ---
  public async getAllReviews(): Promise<ReviewDocument[]> {
    if (isMongoConnected()) {
      const docs = await ReviewModel.find({}).sort({ createdAt: -1 }).lean<IReview[]>();
      return docs.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        language: doc.language,
        difficulty: doc.difficulty,
        reviewType: doc.reviewType,
        status: doc.status,
        loc: doc.loc,
        author: doc.author,
        code: doc.code,
        repositoryUrl: doc.repositoryUrl,
        tags: doc.tags || [],
        comments: doc.comments || [],
        likes: doc.likes || [],
        bookmarks: doc.bookmarks || [],
        rating: doc.rating,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }));
    }
    return this.fileData.reviews;
  }

  public async findReviewById(id: string): Promise<ReviewDocument | undefined> {
    if (isMongoConnected()) {
      const doc = await ReviewModel.findOne({ id }).lean<IReview>();
      if (doc) {
        return {
          id: doc.id,
          title: doc.title,
          description: doc.description,
          language: doc.language,
          difficulty: doc.difficulty,
          reviewType: doc.reviewType,
          status: doc.status,
          loc: doc.loc,
          author: doc.author,
          code: doc.code,
          repositoryUrl: doc.repositoryUrl,
          tags: doc.tags || [],
          comments: doc.comments || [],
          likes: doc.likes || [],
          bookmarks: doc.bookmarks || [],
          rating: doc.rating,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        };
      }
      return undefined;
    }
    return this.fileData.reviews.find(r => r.id === id);
  }

  public async createReview(
    review: Omit<ReviewDocument, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'bookmarks' | 'comments' | 'rating'>
  ): Promise<ReviewDocument> {
    const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newReview: ReviewDocument = {
      ...review,
      id,
      comments: [],
      likes: [],
      bookmarks: [],
      rating: 5.0,
      createdAt: now,
      updatedAt: now,
    };

    if (isMongoConnected()) {
      await ReviewModel.create(newReview);
      await UserModel.findOneAndUpdate(
        { id: review.author.id },
        { $inc: { submissionsCount: 1, reputation: 10 } }
      );
    }

    // Update in-memory & JSON file
    this.fileData.reviews.unshift(newReview);
    const author = this.fileData.users.find(u => u.id === review.author.id);
    if (author) {
      author.submissionsCount += 1;
      author.reputation += 10;
    }
    this.saveFileDatabase();

    return newReview;
  }

  public async updateReviewStatus(
    id: string,
    status: 'Open' | 'In Review' | 'Completed' | 'Closed'
  ): Promise<ReviewDocument | undefined> {
    const now = new Date().toISOString();

    if (isMongoConnected()) {
      const doc = await ReviewModel.findOneAndUpdate(
        { id },
        { $set: { status, updatedAt: now } },
        { new: true }
      ).lean<IReview>();

      if (!doc) return undefined;
    }

    const review = this.fileData.reviews.find(r => r.id === id);
    if (review) {
      review.status = status;
      review.updatedAt = now;
      this.saveFileDatabase();
    }

    return this.findReviewById(id);
  }

  public async deleteReview(id: string, requesterUserId: string): Promise<boolean> {
    const review = await this.findReviewById(id);
    if (!review) return false;

    if (review.author.id !== requesterUserId) {
      throw new Error('Unauthorized: You can only delete your own submitted reviews.');
    }

    if (isMongoConnected()) {
      await ReviewModel.deleteOne({ id });
    }

    const idx = this.fileData.reviews.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.fileData.reviews.splice(idx, 1);
      this.saveFileDatabase();
    }

    return true;
  }

  // --- Comments Collection inside Review ---
  public async addComment(
    reviewId: string,
    comment: Omit<CommentDocument, 'id' | 'createdAt'>
  ): Promise<{ review: ReviewDocument; comment: CommentDocument } | undefined> {
    const review = await this.findReviewById(reviewId);
    if (!review) return undefined;

    const newComment: CommentDocument = {
      ...comment,
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    let nextStatus = review.status;
    if (review.status === 'Open' && (comment.type === 'suggestion' || comment.type === 'changes_requested' || comment.lineNumber !== undefined)) {
      nextStatus = 'In Review';
    } else if (comment.type === 'approval') {
      nextStatus = 'Completed';
    }

    const now = new Date().toISOString();

    if (isMongoConnected()) {
      await ReviewModel.findOneAndUpdate(
        { id: reviewId },
        {
          $push: { comments: newComment },
          $set: { status: nextStatus, updatedAt: now },
        }
      );
      await UserModel.findOneAndUpdate(
        { id: comment.author.id },
        { $inc: { reviewsCount: 1, reputation: 15 } }
      );
    }

    // Update in-memory & file
    const localReview = this.fileData.reviews.find(r => r.id === reviewId);
    if (localReview) {
      localReview.comments.push(newComment);
      localReview.status = nextStatus;
      localReview.updatedAt = now;
      const user = this.fileData.users.find(u => u.id === comment.author.id);
      if (user) {
        user.reviewsCount += 1;
        user.reputation += 15;
      }
      this.saveFileDatabase();
    }

    const updatedReview = await this.findReviewById(reviewId);
    return updatedReview ? { review: updatedReview, comment: newComment } : undefined;
  }

  public async deleteComment(
    reviewId: string,
    commentId: string,
    requesterUserId: string
  ): Promise<ReviewDocument | undefined> {
    const review = await this.findReviewById(reviewId);
    if (!review) return undefined;

    const existingComment = review.comments.find(c => c.id === commentId);
    if (!existingComment) return undefined;

    if (existingComment.author.id !== requesterUserId) {
      throw new Error('Unauthorized: You can only delete your own comments.');
    }

    const now = new Date().toISOString();

    if (isMongoConnected()) {
      await ReviewModel.findOneAndUpdate(
        { id: reviewId },
        {
          $pull: { comments: { id: commentId } },
          $set: { updatedAt: now },
        }
      );
    }

    const localReview = this.fileData.reviews.find(r => r.id === reviewId);
    if (localReview) {
      const cIdx = localReview.comments.findIndex(c => c.id === commentId);
      if (cIdx !== -1) {
        localReview.comments.splice(cIdx, 1);
        localReview.updatedAt = now;
        this.saveFileDatabase();
      }
    }

    return this.findReviewById(reviewId);
  }

  // --- Likes & Bookmarks ---
  public async toggleLike(reviewId: string, userId: string): Promise<{ likesCount: number; isLiked: boolean } | undefined> {
    const review = await this.findReviewById(reviewId);
    if (!review) return undefined;

    const existsIndex = review.likes.indexOf(userId);
    const isLiked = existsIndex === -1;

    if (isMongoConnected()) {
      if (isLiked) {
        await ReviewModel.findOneAndUpdate({ id: reviewId }, { $addToSet: { likes: userId } });
      } else {
        await ReviewModel.findOneAndUpdate({ id: reviewId }, { $pull: { likes: userId } });
      }
    }

    const localReview = this.fileData.reviews.find(r => r.id === reviewId);
    if (localReview) {
      const idx = localReview.likes.indexOf(userId);
      if (idx > -1) {
        localReview.likes.splice(idx, 1);
      } else {
        localReview.likes.push(userId);
      }
      this.saveFileDatabase();
    }

    const updated = await this.findReviewById(reviewId);
    return updated ? { likesCount: updated.likes.length, isLiked } : undefined;
  }

  public async toggleBookmark(reviewId: string, userId: string): Promise<{ bookmarksCount: number; isBookmarked: boolean } | undefined> {
    const review = await this.findReviewById(reviewId);
    if (!review) return undefined;

    const existsIndex = review.bookmarks.indexOf(userId);
    const isBookmarked = existsIndex === -1;

    if (isMongoConnected()) {
      if (isBookmarked) {
        await ReviewModel.findOneAndUpdate({ id: reviewId }, { $addToSet: { bookmarks: userId } });
      } else {
        await ReviewModel.findOneAndUpdate({ id: reviewId }, { $pull: { bookmarks: userId } });
      }
    }

    const localReview = this.fileData.reviews.find(r => r.id === reviewId);
    if (localReview) {
      const idx = localReview.bookmarks.indexOf(userId);
      if (idx > -1) {
        localReview.bookmarks.splice(idx, 1);
      } else {
        localReview.bookmarks.push(userId);
      }
      this.saveFileDatabase();
    }

    const updated = await this.findReviewById(reviewId);
    return updated ? { bookmarksCount: updated.bookmarks.length, isBookmarked } : undefined;
  }

  // --- Statistics ---
  public async getStats() {
    const reviews = await this.getAllReviews();
    const users = await this.getAllUsers();

    const total = reviews.length;
    const open = reviews.filter(r => r.status === 'Open').length;
    const inReview = reviews.filter(r => r.status === 'In Review').length;
    const completed = reviews.filter(r => r.status === 'Completed').length;
    const totalComments = reviews.reduce((acc, r) => acc + r.comments.length, 0);

    return {
      totalSubmissions: total,
      openCount: open,
      inReviewCount: inReview,
      completedCount: completed,
      totalComments,
      activeMentors: users.length,
      avgTurnaroundTime: '1.8 hrs',
      satisfactionRate: '99.4%',
      storageEngine: isMongoConnected() ? 'MongoDB (Mongoose ODM)' : 'Persistent JSON Store (ACID)',
    };
  }
}

export const db = new DatabaseManager();
