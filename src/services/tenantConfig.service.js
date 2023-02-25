import events from '../pubsub/events'
import pubsub from '../pubsub/PubSub.js'
import TenantConfigDAO from '../daos/tenantConfig.dao'

class TenantConfigService {
  constructor () {
    pubsub.subscribe(events.tenant.signUp, this.createConfig)
  }

  async createConfig (newConfigDto, trx) {
    const newConfig = await TenantConfigDAO.insert(newConfigDto, trx)

    return newConfig
  }

  async getConfigs () {
    const foundConfigs = await TenantConfigDAO.findAll()

    return foundConfigs
  }
}

export default new TenantConfigService()
