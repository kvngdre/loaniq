// import credentials from '../middleware/credentials'
import { auth } from 'express-openid-connect'
import { constants } from '../config'
import { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
// import corsOptions from '../config/corsOptions'
import errorMiddleware from '../middleware/error.middleware'
import helmet from 'helmet'
import morgan from 'morgan'
import NotFoundError from '../errors/NotFoundError'
import requestIp from 'request-ip'

const { api, auth0 } = constants
// const config = {
//   authRequired: false,
//   auth0Logout: true,
//   secret: auth0.secret,
//   baseURL: auth0.base_url,
//   clientID: auth0.client_id,
//   issuerBaseURL: auth0.issuer_base_url
// }

export default async function expressLoader (app, routes) {
  if (!app || !routes) {
    throw new Error('Application failed to initialize with errors in argument')
  }

  app.use(helmet())
  app.use(morgan('dev'))
  // app.use(credentials)
  app.use(cors())

  // Parse JSON bodies (as sent by API clients)
  app.use(json())
  app.use(urlencoded({ extended: true }))
  app.use(cookieParser())
  app.use(requestIp.mw())

  // Load API routes
  // app.use(auth(config))
  app.use(api.prefix + api.version, routes())

  // Catch and handle 404
  app.use((_req, _res, next) => {
    const err = new NotFoundError('Resource not found.')
    next(err)
  })

  app.use(errorMiddleware)
}
