import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;
let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectToMongoDB(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[MongoDB] Warning: MONGODB_URI environment variable is not defined.');
    return null;
  }

  if (isConnected) {
    return mongoose;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  console.log(`[MongoDB] Attempting connection to MongoDB (${uri.replace(/:([^:@]+)@/, ':****@')})...`);

  connectionPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  }).then((m) => {
    isConnected = true;
    console.log('[MongoDB] Connected successfully to database:', m.connection.name || 'default');
    return m;
  }).catch((err) => {
    isConnected = false;
    connectionPromise = null;
    console.error('[MongoDB] Connection failure:', err.message);
    throw err;
  });

  return connectionPromise;
}

export function isMongoConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function disconnectMongoDB(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    connectionPromise = null;
    console.log('[MongoDB] Disconnected.');
  }
}
