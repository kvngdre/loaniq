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

  async getConfigs (filters) {
    const foundConfigs = await TenantConfigDAO.findAll(filters)
    const count = Intl.NumberFormat('en-US').format(foundConfigs.length)

    return [count, foundConfigs]
  }

  async getConfig (filter) {
    const foundConfig = await TenantConfigDAO.findByField(filter)
    return foundConfig
  }

  async updateConfig (filter, dto) {
    const updateConfig = await TenantConfigDAO.update(filter, dto)
    return updateConfig
  }

  async deleteConfig (filter) {
    const deletedTenantConfig = await TenantConfigDAO.remove(filter)
    return deletedTenantConfig
  }
}

export default new TenantConfigService()
