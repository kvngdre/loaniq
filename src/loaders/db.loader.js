import mongoose from 'mongoose';
import config from '../config/index.js';
import logger from '../utils/logger.js';

export async function connectDatabase() {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(config.db.uri.dev_remote, config.db.options);
    logger.info(`Connected to database.`);
  } catch (error) {
    logger.fatal('⚠ Failed to connect to DB ⚠', error.stack);
    process.exit(1);
  }
}
