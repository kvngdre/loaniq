import cookieParser from 'cookie-parser';
import cors from 'cors';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import corsOptions from '../config/corsOptions.js';
import config from '../config/index.js';
import NotFoundError from '../errors/notFound.error.js';
import credentials from '../middleware/credentials.js';
import errorMiddleware from '../middleware/error.middleware.js';

const { api } = config;

/**
 * @function initializeApp
 * @description A function that loads the express app and applies the app routes.
 * @summary Loads and configures an express app.
 * @param {import('express').Application} app The express app to load.
 * @param {import('./jsdoc/getAppRoutes.js').getAppRoutes} getAppRoutes A function that returns an express router with the app routes.
 * @throws {Error} If app or getAppRoutes are not provided.
 * @exports initializeApp
 */
export async function initializeApp(app, getAppRoutes) {
  if (!app || !getAppRoutes) {
    throw new Error(
      'Application failed to initialize with errors in argument.',
    );
  }

  app.use(credentials);
  app.use(cors(corsOptions));
  app.use(helmet());
  app.use(morgan('dev'));

  // Parse JSON bodies (as sent by API clients)
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(cookieParser());

  // Load API routes
  app.use(`/${api.prefix}/${api.version}`, routes());

  // Catch and handle 404
  app.use((req, res, next) => {
    const err = new NotFoundError('Resource Not Found');
    next(err);
  });

  app.use(errorMiddleware);
}
