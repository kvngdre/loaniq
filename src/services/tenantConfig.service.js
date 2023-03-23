import events from '../pubsub/events'
import pubsub from '../pubsub/pubsub.js'
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

  async getConfig (tenantId, projection) {
    const foundConfig = await TenantConfigDAO.findOne({ tenantId }, projection)
    return foundConfig
  }

  async updateConfig (tenantId, dto, projection) {
    const updateConfig = await TenantConfigDAO.update({ tenantId }, dto, projection)
    return updateConfig
  }

  async deleteConfig (tenantId) {
    const deletedConfig = await TenantConfigDAO.remove({ tenantId })
    return deletedConfig
  }
}

export default new TenantConfigService()
