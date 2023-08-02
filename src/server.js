import "dotenv/config.js";
import "express-async-errors";
import "./loaders/process.js";

import express from "express";
import http from "http";

import dbService from "./db.-service.js";
import loaders from "./loaders/index.js";
import logger from "./utils/logger.js";

const app = express();
export const server = http.createServer(app);

console.clear();

async function bootstrap() {
  try {
    await loaders.init(app);

    await dbService.connect();

    server.listen(process.env.PORT, () => {
      logger.info(`Server running on port: ${process.env.PORT} 🚀`);
    });
  } catch (error) {
    logger.fatal(error.message, error.stack);
  }
}

bootstrap();
