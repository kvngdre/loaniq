import 'express-async-errors'
import { constants } from './config'
import loaders from './loaders'
import logger from './utils/logger'
import routes from './routers'

function startServer () {
  const app = require('express')()
  const port = constants.port

  loaders.init({ expressApp: app, expressRoutes: routes })

  app.listen(port, (err) => {
    if (err) logger.error(err)
    logger.info(`Server running on port: ${port}`)
  })
}

startServer()
