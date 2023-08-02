import 'dotenv/config.js';
import express from 'express';
import 'express-async-errors';
import http from 'http';
import './loaders/process.js';

import { constants } from './config/index.js';
import loaders from './loaders/index.js';
import routes from './routers/index.js';
import logger from './utils/logger.js';

import randomString from './utils/randomString.js';

const app = express();
export const server = http.createServer(app);

async function startServer() {
  try {
    const { port } = constants;

    await loaders.init({ expressApp: app, expressRoutes: routes });

    server.listen(port, () => {
      logger.info(`Server listening on port: ${port} 🚀`);
    });

    return server;
  } catch (error) {
    logger.fatal(error.message, error.stack);
  }
}
console.log(randomString());

startServer();
