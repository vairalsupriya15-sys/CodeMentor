import dotenv from 'dotenv';
import { connectToMongoDB, isMongoConnected, disconnectMongoDB } from './connection';
import { db } from './db';
import { UserModel, ReviewModel } from './models';

dotenv.config();

async function runSeed() {
  console.log('=== CodeMentor MongoDB Seed & Migration Tool ===');
  
  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI environment variable is missing.');
    console.error('Usage: MONGODB_URI="mongodb://localhost:27017/codementor" npm run seed');
    process.exit(1);
  }

  try {
    await connectToMongoDB();
    if (!isMongoConnected()) {
      throw new Error('Failed to establish MongoDB connection.');
    }

    console.log('Connected to MongoDB successfully.');
    console.log('Migrating users and reviews from data/database.json...');

    const result = await db.syncWithMongoDB();
    console.log(`Migration summary: ${result.usersMigrated} new users added, ${result.reviewsMigrated} new reviews added.`);

    const userCount = await UserModel.countDocuments();
    const reviewCount = await ReviewModel.countDocuments();
    console.log(`Current MongoDB database totals: ${userCount} users, ${reviewCount} reviews.`);

    await disconnectMongoDB();
    console.log('Seed completed cleanly.');
    process.exit(0);
  } catch (err: any) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

runSeed();
