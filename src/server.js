import 'express-async-errors'
import { constants } from './config'
import loaders from './loaders'
import logger from './utils/logger'
import routes from './routers'
import express from 'express'
import http from 'http'

async function startServer () {
  const app = express()
  const port = constants.port
  const server = http.createServer(app)

  await loaders.init({ expressApp: app, expressRoutes: routes })

  server.listen(port, (err) => {
    if (err) logger.fatal(err.message, err.stack)
    logger.info(`Server listening on port: ${port} 🚀`)
  })

  return server
}

export const server = startServer()
