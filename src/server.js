import 'express-async-errors'
import { constants } from './config'
import loaders from './loaders'
import routes from './routers'

// import TConfigDAO from './daos/tconfig.dao'
// import events from './pubsub/events'
// import pubsub from './pubsub/PubSub.js'

// class ConfigService {
//   constructor () {
//     console.log('config service')
//     pubsub.subscribe(events.tenant.signUp, this.createConfig)
//   }

//   async createConfig (newConfigDto, trx) {
//     const newConfig = await TConfigDAO.insert(newConfigDto, trx)

//     return newConfig
//   }
// }

// export default new ConfigService()

function startServer () {
  const app = require('express')()
  const port = constants.port

  loaders.init({ expressApp: app, expressRoutes: routes })

  app.listen(port, (err) => {
    if (err) console.error(err)

    console.log(`Server running on port: ${port}`)
  })
}

startServer()
