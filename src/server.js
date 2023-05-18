import express from 'express';
import 'express-async-errors';
import http from 'http';
import { constants } from './config/index.js';
import loaders from './loaders/index.js';
import './loaders/process.js';
import routes from './routers/index.js';
import { HttpCodes } from './utils/HttpCodes.js';
import logger from './utils/logger.js';

import randomString from './utils/randomString.js';

const app = express();
export const server = http.createServer(app);

async function startServer() {
  try {
    const port = constants.port;

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
