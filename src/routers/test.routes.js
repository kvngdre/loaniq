import express from 'express'
import { httpCodes } from '../utils/constants'
import pkg from '../../package.json'

const app = express()
app.set('pkg', pkg)

const router = express.Router()

router.get('/status', (req, res) => {
  res.status(httpCodes.OK).send('OK ✔')
})

router.get('/', (req, res) => {
  const info = {
    appName: app.get('pkg').name,
    appDescription: app.get('pkg').description,
    appAuthor: app.get('pkg').author,
    appVersion: app.get('pkg').version
  }

  res.status(httpCodes.OK).json(info)
})

export default router
