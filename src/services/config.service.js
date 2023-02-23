import { insert } from '../daos/config.dao'
import { tenant } from '../pubsub/events'
import { subscribe } from '../pubsub/PubSub'

class ConfigService {
  constructor () {
    subscribe(tenant.signUp, this.createConfig)
  }

  async createConfig (newConfigDto, trx) {
    const newConfig = await insert(newConfigDto, trx)

    return newConfig
  }
}

export default new ConfigService()
