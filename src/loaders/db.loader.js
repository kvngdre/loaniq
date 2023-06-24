import mongoose from 'mongoose';
import { dbConfig } from '../config/index.js';
import logger from '../utils/logger.js';

export default async () => {
  mongoose.set('strictQuery', true);

  await mongoose
    .connect(dbConfig.uri[dbConfig.env], dbConfig.options)
    .then(() => logger.info(`Connected to ${dbConfig.env} DB.`))
    .catch((error) => {
      logger.fatal('⚠ Failed to connect to DB ⚠', error.stack);
      process.exit(1);
    });
};
