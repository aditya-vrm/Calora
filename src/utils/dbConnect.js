import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn(
    'Warning: MONGODB_URI environment variable is not defined. Calora will run in Local Fallback mode (client-only).'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (!MONGODB_URI) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'Calora',
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('MongoDB successfully connected.');
      return mongooseInstance;
    }).catch((err) => {
      console.error('MongoDB connection failed:', err.message);
      cached.promise = null; // Reset cached promise on failure to retry later
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.conn = null;
    return null;
  }

  return cached.conn;
}

export default dbConnect;
