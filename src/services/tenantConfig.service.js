import events from '../pubsub/events'
import pubsub from '../pubsub/PubSub.js'
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

  async getConfig (tenantId) {
    const foundConfig = await TenantConfigDAO.findByField({ tenantId })

    return foundConfig
  }

  async updateConfig (tenantId, dto) {
    const updateConfig = await TenantConfigDAO.update({ tenantId }, dto)

    return updateConfig
  }

  async deleteConfig (tenantId) {
    const deletedTenantConfig = await TenantConfigDAO.remove({ tenantId })

    return deletedTenantConfig
  }
}

export default new TenantConfigService()
