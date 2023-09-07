import "dotenv/config.js";
import "express-async-errors";

import http from "http";

import dbContext from "./data/db-context.js";
import { logger } from "./utils/logger.js";
import { App } from "./web/application.js";

async function bootstrap() {
  try {
    const { app } = new App({ morgan: { mode: "dev" } });
    const server = http.createServer(app);

    await dbContext.connect();

    server.listen(process.env.PORT, () => {
      logger.info(`Server listening on port: ${process.env.PORT}`);
    });

    // TODO: register process listeners
  } catch (error) {
    logger.fatal(error.message, error.stack);
  }
}

bootstrap();
