import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import requestIp from "request-ip";

import { logger } from "../utils/index.js";
import {
  errorHandlingMiddleware,
  resourceNotFoundMiddleware,
} from "./middleware/index.js";
import { appRouter } from "./routers/index.js";

/**
 * @typedef ApplicationOptions
 * @type {Object}
 * @property {Object} morgan
 * @property {("combined"|"common"|"dev"|"short"|"tiny")} morgan.mode
 */

export class App {
  /** @type {express.Express} */
  #app;

  /**
   * @param {ApplicationOptions} options
   */
  constructor(options) {
    this.setup(options);
  }

  /**
   *
   * @param {ApplicationOptions} options
   */
  setup(options) {
    this.#app = express();

    this.#app.use(helmet());
    this.#app.use(cors({ credentials: true }));
    this.#app.use(express.json());
    this.#app.use(express.urlencoded({ extended: true }));
    this.#app.use(cookieParser());
    this.#app.use(requestIp.mw());
    this.#app.use(
      morgan(options.morgan.mode, {
        stream: {
          write: (message) => {
            logger.http(message.trim());
          },
        },
      }),
    );

    this.#app.use("/api/v1", appRouter);

    this.#app.use(resourceNotFoundMiddleware);
    this.#app.use(errorHandlingMiddleware);
  }

  get app() {
    return this.#app;
  }
}
