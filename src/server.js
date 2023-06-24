import 'express-async-errors';
import './loaders/process.js';

import express from 'express';
import http from 'http';

import loaders from './loaders/index.js';
import routes from './routers/index.js';
import logger from './utils/logger.js';

const app = express();
export const server = http.createServer(app);

console.clear();

async function startServer() {
  try {
    await loaders.init({ app: app, routes: routes });

    server.listen(process.env.PORT, () => {
      logger.info(`Server running on port: ${process.env.PORT} 🚀`);
    });
  } catch (error) {
    logger.fatal(error.message, error.stack);
  }
}

startServer();
