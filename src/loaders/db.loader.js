import mongoose from 'mongoose';
import config from '../config/index.js';
import logger from '../utils/logger.js';

export default async () => {
  mongoose.set('strictQuery', true);

  await mongoose
    .connect(config.db.uri.development, config.db.options)
    .then(() => logger.info(`Connected to database.`))
    .catch((error) => {
      logger.fatal('⚠ Failed to connect to DB ⚠', error.stack);
      process.exit(1);
    });
};
