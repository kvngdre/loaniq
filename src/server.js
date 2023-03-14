import 'express-async-errors'
import { constants } from './config'
import loaders from './loaders'
import logger from './utils/logger'
import routes from './routers'

async function startServer () {
  const app = require('express')()
  const port = constants.port

  await loaders.init({ expressApp: app, expressRoutes: routes })

  app.listen(port, (err) => {
    if (err) logger.fatal(err.message, err.stack)
    logger.info(`Server listening on port: ${port} 🚀`)
  })
}

startServer()
