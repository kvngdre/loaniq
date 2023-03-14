import dbLoader from './db.loader'
import expressLoader from './express.loader'

export default {
  init: async ({ expressApp = null, expressRoutes = null }) => {
    await dbLoader()

    await expressLoader(expressApp, expressRoutes)
  }
}
