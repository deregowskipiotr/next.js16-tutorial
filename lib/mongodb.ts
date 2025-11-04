// lib/mongodb.ts
import mongoose, { Mongoose } from "mongoose";

// Extend NodeJS global interface to include our mongoose cached connection
declare global {
  
  var mongoose:
    | {
        conn: Mongoose | null;
        promise: Promise<Mongoose> | null;
      }
    | undefined;
}

// MongoDB connection URI - should be stored in environment variables for security
const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// FIXED: Use type assertion to ensure cached is never undefined
const cached: {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
} = global.mongoose || { conn: null, promise: null };

// Initialize global mongoose cache if it doesn't exist
if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose with connection caching
 * @returns {Promise<Mongoose>} Mongoose instance with active connection
 * @throws {Error} If MONGODB_URI is not defined or connection fails
 */
async function dbConnect(): Promise<Mongoose> {
  // Return cached connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection promise exists, create a new one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    // Create connection promise with error handling
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Wait for connection promise to resolve and cache the connection
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset promise on connection failure to allow retry
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;
