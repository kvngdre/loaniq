import "dotenv/config.js";
import "express-async-errors";

import http from "http";

import dbContext from "./data/db-context.js";
import { logger } from "./utils/logger.utils.js";
import { App } from "./web/application.js";

async function bootstrap() {
  const { app } = new App({ morgan: { mode: "dev" } });
  const server = http.createServer(app);

  // Register Process Listeners
  process.on("SIGTERM", async () => {
    logger.info("SIGTERM signal received: shutting down gracefully");
    await dbContext.disconnect();
    server.close();
    process.exit(0);
  });

  process.on("unhandledRejection", (reason) => {
    throw reason;
  });

  process.on("uncaughtException", (error) => {
    logger.fatal("Uncaught Exception:", error.stack);

    dbContext
      .disconnect()
      .then(() => {
        server.close();
        console.log("Disconnected from database");
        process.exit(1);
      })
      .catch((err) => {
        logger.fatal("Error disconnecting from database:", err);
        server.close();
        process.exit(1);
      });
  });

  await dbContext.connect();
  server.listen(process.env.PORT, () => {
    logger.info(`Server listening on port:${process.env.PORT}`);
  });
}

bootstrap();
