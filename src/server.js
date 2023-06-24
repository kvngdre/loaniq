import express from 'express';
import 'express-async-errors';
import http from 'http';
import config from './config/index.js';
import loaders from './loaders/index.js';
import './loaders/process.js';
import routes from './routers/index.js';
import logger from './utils/logger.js';

import randomString from './utils/randomString.js';

const app = express();
const port = config.port;
export const server = http.createServer(app);

async function startServer() {
  try {
    await loaders.init({ expressApp: app, expressRoutes: routes });

    server.listen(port, () => {
      logger.info(`Server listening on port: ${port} 🚀`);
    });
  } catch (error) {
    /**@type {Error} */
    const err = error;

    logger.fatal(err.message, err.stack);
  }
}
console.log(randomString());

startServer();
