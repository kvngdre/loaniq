import dbLoader from './db.loader.js'
import expressLoader from './express.loader.js'

export default {
  init: async ({ expressApp = null, expressRoutes = null }) => {
    dbLoader()

    await expressLoader(expressApp, expressRoutes)
  }
}
