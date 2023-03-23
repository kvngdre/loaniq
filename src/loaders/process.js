import ErrorHandler from '../utils/ErrorHandler'

process.on('uncaughtException', (error) => {
  console.error(`Uncaught Exception ${error.message}`, error.stack)

  ErrorHandler.handleError(error)
})

process.on('unhandledRejection', (error) => {
  console.error(`Unhandled Rejection ${error.message}`, error.stack)

  ErrorHandler.handleError(error)
})
