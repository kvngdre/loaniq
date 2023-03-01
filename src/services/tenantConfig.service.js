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
    const count = Intl.NumberFormat('en-US').format(foundConfigs.length)

    return [count, foundConfigs]
  }

  async getConfig (tenantId) {
    const foundConfig = await TenantConfigDAO.findByField({ tenantId })

    return foundConfig
  }

  async updateConfig (tenantId, updateDto) {
    const updateConfig = await TenantConfigDAO.update({ tenantId }, updateDto)

    return updateConfig
  }

  async deleteConfig (tenantId) {
    const deletedTenantConfig = await TenantConfigDAO.remove({ tenantId })

    return deletedTenantConfig
  }
}

export default new TenantConfigService()
