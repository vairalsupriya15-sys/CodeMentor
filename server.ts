import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { db, UserDocument } from './src/server/db';
import { connectToMongoDB, isMongoConnected } from './src/server/connection';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'codementor_college_jwt_secret_key_2026';

// Extended Express Request with Authenticated User
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

// Authentication Middleware
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to perform this action.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; username: string };
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token. Please sign in again.'
    });
  }
}

// Optional Auth Middleware (attaches user if token present)
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; username: string };
      req.user = decoded;
    } catch {
      // Ignore token parse failure for optional auth
    }
  }
  next();
}

// Strip password hash from user response
function sanitizeUser(user: UserDocument) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export function setupServer() {
  const app = express();
  app.use(express.json());

  // --- API Routes ---

  // 1. Health check
  app.get('/api/health', (_req, res) => {
    const mongoActive = isMongoConnected();
    res.json({
      success: true,
      service: 'CodeMentor MERN Peer Review API',
      status: 'operational',
      database: mongoActive ? 'MongoDB (Mongoose ODM)' : 'JSON File Storage (Fallback / Offline)',
      mongodbConnected: mongoActive,
      timestamp: new Date().toISOString()
    });
  });

  // 2. Authentication: Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, username, email, password, college, role } = req.body;

      if (!name || !username || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Name, username, email, and password are required fields.'
        });
      }

      const formattedUsername = username.startsWith('@') ? username : `@${username}`;

      // Check duplicate email
      const existingUserByEmail = await db.findUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email address already exists.'
        });
      }

      // Check duplicate username
      const existingUserByUsername = await db.findUserByUsername(formattedUsername);
      if (existingUserByUsername) {
        return res.status(409).json({
          success: false,
          error: 'This username is already taken. Please choose another username.'
        });
      }

      // Hash password using bcryptjs
      const passwordHash = bcrypt.hashSync(password, 10);

      // Generate initials for avatar
      const initials = name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const newUser = await db.createUser({
        name: name.trim(),
        username: formattedUsername.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role: role || 'Computer Science Student',
        college: college || 'Engineering College',
        avatar: initials || 'ST',
        reputation: 100,
        reviewsCount: 0,
        submissionsCount: 0
      });

      // Issue JWT Token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, username: newUser.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: sanitizeUser(newUser)
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error during registration.' });
    }
  });

  // 3. Authentication: Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Both email and password are required.'
        });
      }

      const user = await db.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials. User not found with this email.'
        });
      }

      // Verify password with bcrypt
      const isMatch = bcrypt.compareSync(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid password. Please check your password and try again.'
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Signed in successfully.',
        token,
        user: sanitizeUser(user)
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Server error during login.' });
    }
  });

  // 4. Authentication: Demo Student Login (for quick testing/viva demonstration)
  app.post('/api/auth/demo-login', async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await db.findUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Demo student profile not found.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: `Switched to ${user.name} (${user.username}).`,
        token,
        user: sanitizeUser(user)
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Error switching demo user.' });
    }
  });

  // 5. Authentication: Current User
  app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res) => {
    const user = await db.findUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }
    res.json({
      success: true,
      user: sanitizeUser(user)
    });
  });

  // Backward compatibility endpoint for current user
  app.get('/api/users/current', optionalAuth, async (req: AuthRequest, res) => {
    const allUsers = await db.getAllUsers();
    const userId = req.user?.id || (allUsers[0]?.id ?? 'usr_1');
    const user = (await db.findUserById(userId)) || allUsers[0];
    if (!user) {
      return res.status(404).json({ error: 'No users found' });
    }
    res.json(sanitizeUser(user));
  });

  // 6. Users / Leaderboard
  app.get('/api/users', async (_req, res) => {
    const users = (await db.getAllUsers()).map(sanitizeUser);
    res.json(users);
  });

  // 7. Platform Statistics
  app.get('/api/stats', async (_req, res) => {
    res.json(await db.getStats());
  });

  // 8. Reviews: List with Search, Filter & Pagination
  app.get('/api/reviews', optionalAuth, async (req: AuthRequest, res) => {
    const {
      search,
      language,
      status,
      difficulty,
      reviewType,
      tag,
      sort,
      authorId,
      bookmarkedOnly,
      page,
      limit
    } = req.query;

    let reviews = await db.getAllReviews();

    // Search query
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      reviews = reviews.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.language.toLowerCase().includes(q) ||
          r.author.name.toLowerCase().includes(q) ||
          r.author.username.toLowerCase().includes(q) ||
          r.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Language filter
    if (language && language !== 'All') {
      reviews = reviews.filter(r => r.language.toLowerCase() === (language as string).toLowerCase());
    }

    // Status filter
    if (status && status !== 'All') {
      reviews = reviews.filter(r => r.status === status);
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'All') {
      reviews = reviews.filter(r => r.difficulty === difficulty);
    }

    // Category / Review Type filter
    if (reviewType && reviewType !== 'All') {
      reviews = reviews.filter(r => r.reviewType === reviewType);
    }

    // Tag filter
    if (tag && typeof tag === 'string') {
      reviews = reviews.filter(r => r.tags.map(t => t.toLowerCase()).includes((tag as string).toLowerCase()));
    }

    // Filter by author ID
    if (authorId && typeof authorId === 'string') {
      reviews = reviews.filter(r => r.author.id === authorId);
    }

    // Filter by bookmarked
    if (bookmarkedOnly === 'true' && req.user) {
      reviews = reviews.filter(r => r.bookmarks.includes(req.user!.id));
    }

    // Sort order
    if (sort === 'popular') {
      reviews.sort((a, b) => b.likes.length - a.likes.length);
    } else if (sort === 'rating') {
      reviews.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'oldest') {
      reviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Attach user-specific computed flags: isLiked, isBookmarked
    const userId = req.user?.id;
    const enrichedReviews = reviews.map(r => ({
      ...r,
      likesCount: r.likes.length,
      bookmarksCount: r.bookmarks.length,
      reviewCount: r.comments.length,
      isLiked: userId ? r.likes.includes(userId) : false,
      isBookmarked: userId ? r.bookmarks.includes(userId) : false
    }));

    // Optional Pagination
    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.max(1, parseInt(limit as string, 10));
      const total = enrichedReviews.length;
      const totalPages = Math.ceil(total / limitNum);
      const paginated = enrichedReviews.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return res.json({
        reviews: paginated,
        total,
        page: pageNum,
        totalPages
      });
    }

    res.json(enrichedReviews);
  });

  // 9. Reviews: Get by ID
  app.get('/api/reviews/:id', optionalAuth, async (req: AuthRequest, res) => {
    const review = await db.findReviewById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Project review submission not found.' });
    }

    const userId = req.user?.id;
    res.json({
      ...review,
      likesCount: review.likes.length,
      bookmarksCount: review.bookmarks.length,
      reviewCount: review.comments.length,
      isLiked: userId ? review.likes.includes(userId) : false,
      isBookmarked: userId ? review.bookmarks.includes(userId) : false
    });
  });

  // 10. Reviews: Create new submission
  app.post('/api/reviews', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { title, description, language, difficulty, reviewType, code, repositoryUrl, tags } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Project title is required.' });
      }
      if (!code || !code.trim()) {
        return res.status(400).json({ success: false, error: 'Source code content is required.' });
      }
      if (!language) {
        return res.status(400).json({ success: false, error: 'Programming language is required.' });
      }

      const user = await db.findUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User profile not found.' });
      }

      const loc = code.split('\n').filter((l: string) => l.trim().length > 0).length || 1;

      const newReview = await db.createReview({
        title: title.trim(),
        description: description?.trim() || 'College project submitted for peer inspection.',
        language,
        difficulty: difficulty || 'Beginner',
        reviewType: reviewType || 'Course Assignment',
        status: 'Open',
        loc,
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          college: user.college,
          avatar: user.avatar,
          role: user.role
        },
        code,
        repositoryUrl: repositoryUrl?.trim() || '',
        tags: Array.isArray(tags) && tags.length > 0 ? tags : [language, reviewType || 'Assignment']
      });

      res.status(201).json({
        success: true,
        message: 'Project published for review successfully.',
        review: {
          ...newReview,
          likesCount: 0,
          bookmarksCount: 0,
          reviewCount: 0,
          isLiked: false,
          isBookmarked: false
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to submit code review.' });
    }
  });

  // 11. Reviews: Update Status
  app.patch('/api/reviews/:id/status', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { status } = req.body;
      if (!['Open', 'In Review', 'Completed', 'Closed'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status must be one of: Open, In Review, Completed, Closed.'
        });
      }

      const updated = await db.updateReviewStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Review not found.' });
      }

      const userId = req.user?.id;
      res.json({
        success: true,
        message: `Status updated to ${status}.`,
        review: {
          ...updated,
          likesCount: updated.likes.length,
          bookmarksCount: updated.bookmarks.length,
          reviewCount: updated.comments.length,
          isLiked: userId ? updated.likes.includes(userId) : false,
          isBookmarked: userId ? updated.bookmarks.includes(userId) : false
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to update review status.' });
    }
  });

  // 12. Reviews: Delete Review (Author only)
  app.delete('/api/reviews/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const success = await db.deleteReview(req.params.id, req.user!.id);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Review not found.' });
      }
      res.json({
        success: true,
        message: 'Project review deleted successfully.'
      });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  });

  // 13. Comments: Add Comment / Line Review
  app.post('/api/reviews/:id/comments', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { content, lineNumber, type } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, error: 'Comment feedback cannot be empty.' });
      }

      const user = await db.findUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User profile not found.' });
      }

      const result = await db.addComment(req.params.id, {
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          reputation: user.reputation
        },
        content: content.trim(),
        lineNumber: lineNumber !== undefined && lineNumber !== null ? Number(lineNumber) : undefined,
        type: type || 'general'
      });

      if (!result) {
        return res.status(404).json({ success: false, error: 'Review submission not found.' });
      }

      const userId = req.user?.id;
      res.status(201).json({
        success: true,
        message: 'Feedback comment posted.',
        comment: result.comment,
        review: {
          ...result.review,
          likesCount: result.review.likes.length,
          bookmarksCount: result.review.bookmarks.length,
          reviewCount: result.review.comments.length,
          isLiked: userId ? result.review.likes.includes(userId) : false,
          isBookmarked: userId ? result.review.bookmarks.includes(userId) : false
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to add comment.' });
    }
  });

  // 14. Comments: Delete Comment (Author only)
  app.delete('/api/reviews/:id/comments/:commentId', requireAuth, async (req: AuthRequest, res) => {
    try {
      const updatedReview = await db.deleteComment(req.params.id, req.params.commentId, req.user!.id);
      if (!updatedReview) {
        return res.status(404).json({ success: false, error: 'Review or comment not found.' });
      }

      const userId = req.user?.id;
      res.json({
        success: true,
        message: 'Comment deleted successfully.',
        review: {
          ...updatedReview,
          likesCount: updatedReview.likes.length,
          bookmarksCount: updatedReview.bookmarks.length,
          reviewCount: updatedReview.comments.length,
          isLiked: userId ? updatedReview.likes.includes(userId) : false,
          isBookmarked: userId ? updatedReview.bookmarks.includes(userId) : false
        }
      });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  });

  // 15. Toggle Like
  app.post('/api/reviews/:id/like', requireAuth, async (req: AuthRequest, res) => {
    try {
      const result = await db.toggleLike(req.params.id, req.user!.id);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Review not found.' });
      }
      res.json({
        success: true,
        ...result
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Backward-compatible toggle like
  app.post('/api/reviews/:id/toggle-like', optionalAuth, async (req: AuthRequest, res) => {
    const allUsers = await db.getAllUsers();
    const userId = req.user?.id || (allUsers[0]?.id ?? 'usr_1');
    const result = await db.toggleLike(req.params.id, userId);
    if (!result) return res.status(404).json({ error: 'Review not found' });
    res.json({ likesCount: result.likesCount, isLiked: result.isLiked });
  });

  // 16. Toggle Bookmark
  app.post('/api/reviews/:id/bookmark', requireAuth, async (req: AuthRequest, res) => {
    try {
      const result = await db.toggleBookmark(req.params.id, req.user!.id);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Review not found.' });
      }
      res.json({
        success: true,
        ...result
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Backward-compatible toggle bookmark
  app.post('/api/reviews/:id/toggle-bookmark', optionalAuth, async (req: AuthRequest, res) => {
    const allUsers = await db.getAllUsers();
    const userId = req.user?.id || (allUsers[0]?.id ?? 'usr_1');
    const result = await db.toggleBookmark(req.params.id, userId);
    if (!result) return res.status(404).json({ error: 'Review not found' });
    res.json({ bookmarksCount: result.bookmarksCount, isBookmarked: result.isBookmarked });
  });

  return app;
}

async function startServer() {
  // Initialize Database Connection: Attempt MongoDB first
  try {
    if (process.env.MONGODB_URI) {
      console.log('[Server] Connecting to MongoDB...');
      await connectToMongoDB();
      if (isMongoConnected()) {
        console.log('[Server] Connected to MongoDB. Running initial sync from data/database.json...');
        await db.syncWithMongoDB();
      }
    } else {
      console.log('[Server] Note: MONGODB_URI not provided. Running in JSON File Persistence mode.');
      console.log('[Server] To connect to MongoDB, define MONGODB_URI in your .env file or environment.');
    }
  } catch (err: any) {
    console.error('[Server] MongoDB connection error:', err.message);
    if (process.env.REQUIRE_MONGODB === 'true') {
      console.error('[Server] Fatal: REQUIRE_MONGODB is true and database connection failed. Halting.');
      process.exit(1);
    }
    console.warn('[Server] Continuing with JSON persistence fallback store so applet remains operational.');
  }

  const app = setupServer();
  const PORT = process.env.PORT || 3000;

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa'
    });
    app.use(vite.middlewares);

    // Fallback for HTML entry point
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) return next();
      try {
        const url = req.originalUrl;
        const htmlPath = path.resolve(__dirname, 'index.html');
        if (fs.existsSync(htmlPath)) {
          let template = fs.readFileSync(htmlPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } else {
          next();
        }
      } catch (e) {
        next(e);
      }
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`CodeMentor Student Peer Review Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting CodeMentor server:', err);
});
