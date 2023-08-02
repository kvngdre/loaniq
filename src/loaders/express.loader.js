import cookieParser from "cookie-parser";
import cors from "cors";
import { json, urlencoded } from "express";
import helmet from "helmet";
import morgan from "morgan";

import corsOptions from "../config/corsOptions.js";
import { NotFoundException } from "../errors/index.js";
import credentials from "../middleware/credentials.js";
import { ErrorHandlingMiddleware } from "../middleware/index.js";
import router from "../routers/index.js";

export default async function expressLoader(app) {
  if (!app) {
    throw new Error("Application failed to initialize with errors in argument");
  }

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(morgan("dev"));
  app.use(credentials);

  // Parse JSON bodies (as sent by API clients)
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(cookieParser());

  // Load API routes
  app.use("/api/v1", router);

  // Catch and handle 404
  app.use((_req, _res, next) => {
    const err = new NotFoundException("Resource Not Found");
    next(err);
  });

  app.use(ErrorHandlingMiddleware.handleError());
}
