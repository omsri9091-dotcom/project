import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ENV } from './env';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDatabase = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);

    if (ENV.MONGODB_URI === 'memory' || ENV.MONGODB_URI === 'mongodb-memory://localhost/test') {
      console.log('⚡ [ADEXA DB] Starting explicit in-memory MongoDB instance because memory mode was requested.');
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      await mongoose.connect(uri);
      console.log('✅ [ADEXA DB] Connected to explicit in-memory MongoDB instance.');
      return;
    }

    const uri = ENV.MONGODB_URI || 'mongodb://127.0.0.1:27017/adexa_db';
    console.log(`📡 [ADEXA DB] Attempting connection to MongoDB: ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ [ADEXA DB] MongoDB connected successfully.');
  } catch (error) {
    console.error('❌ [ADEXA DB] MongoDB connection failed. The app requires a real MongoDB connection or an explicit memory-mode override.');
    console.error('Use: MONGODB_URI=mongodb://127.0.0.1:27017/adexa_db or MONGODB_URI=memory');
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
