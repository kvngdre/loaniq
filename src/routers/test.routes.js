import express from 'express'
import { httpCodes } from '../utils/common'
import pkg from '../../package.json'

const app = express()
app.set('pkg', pkg)

const router = express.Router()

router.get('/status', (_req, res) => {
  try {
    res.status(httpCodes.OK).json({ message: 'OK ✔' })
  } catch (exception) {
    res.status(httpCodes.BAD_REQUEST).json({ error: exception.message })
  }
})

router.get('/info', (_req, res) => {
  const info = {
    appName: app.get('pkg').name,
    appDescription: app.get('pkg').description,
    appAuthor: app.get('pkg').author,
    appVersion: app.get('pkg').version
  }

  res.status(httpCodes.OK).json(info)
})

export default router
