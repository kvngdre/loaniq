import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import corsOptions from '../config/corsOptions.js';
import errorMiddleware from '../middleware/error.middleware.js';
import { constants } from '../config/index.js';
import credentials from '../middleware/credentials.js';
import NotFoundError from '../errors/NotFoundError.js';

const { api } = constants;

export default async function expressLoader(app, routes) {
  if (!app || !routes) {
    throw new Error('Application failed to initialize with errors in argument');
  }

  app.use(helmet());
  app.use(morgan('dev'));
  app.use(credentials);
  app.use(cors(corsOptions));

  // Parse JSON bodies (as sent by API clients)
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(cookieParser());

  // Load API routes
  app.use(api.prefix + api.version, routes());

  // Catch and handle 404
  app.use((_req, _res, next) => {
    const err = new NotFoundError('Resource not found.');
    next(err);
  });

  app.use(errorMiddleware);
}
