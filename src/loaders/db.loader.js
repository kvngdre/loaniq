import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export default async () => {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(process.env.DB_URI_REMOTE);
    logger.info('Connected to DB.');
  } catch (error) {
    logger.fatal('Failed to connect to DB', error.stack);
    process.exit(1);
  }
};
