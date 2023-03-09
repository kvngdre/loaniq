import events from '../pubsub/events'
import pubsub from '../pubsub/index.js'
import TenantConfigDAO from '../daos/tenantConfig.dao'

class TenantConfigService {
  constructor () {
    pubsub.subscribe(events.tenant.signUp, this.createConfig)
  }

  async createConfig (dto, trx) {
    const newConfig = await TenantConfigDAO.insert(dto, trx)
    return newConfig
  }

  async getConfigs (filters, projection) {
    const foundConfigs = await TenantConfigDAO.findAll(filters, projection)
    const count = Intl.NumberFormat('en-US').format(foundConfigs.length)

    return [count, foundConfigs]
  }

  async getConfig (filter, projection) {
    const foundConfig = await TenantConfigDAO.findOne(filter, projection)
    return foundConfig
  }

  async updateConfig (filter, dto, projection) {
    const updateConfig = await TenantConfigDAO.update(filter, dto, projection)
    return updateConfig
  }

  async deleteConfig (filter) {
    const deletedConfig = await TenantConfigDAO.remove(filter)
    return deletedConfig
  }
}

export default new TenantConfigService()
