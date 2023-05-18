import ErrorHandler from '../utils/ErrorHandler.js';

process.on('uncaughtException', (error) => {
  console.error(`! Uncaught Exception ${error}`);

  ErrorHandler.handleError(error);
});

process.on('unhandledRejection', (error) => {
  console.error(`! Unhandled Rejection ${error.message}`);

  ErrorHandler.handleError(error);
});
