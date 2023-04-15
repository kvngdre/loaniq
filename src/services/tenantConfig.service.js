import { events, pubsub } from '../pubsub/index.js'
import TenantConfigDAO from '../daos/tenantConfig.dao.js'

class TenantConfigService {
  constructor () {
    pubsub.subscribe(events.tenant.signUp, this.createConfig)
  }

  async createConfig (dto, trx) {
    const newConfig = await TenantConfigDAO.insert(dto, trx)
    return newConfig
  }

  async getConfigs (filter, projection) {
    const foundConfigs = await TenantConfigDAO.find(filter, projection)
    const count = Intl.NumberFormat('en-US').format(foundConfigs.length)

    return [count, foundConfigs]
  }

  async getConfig (filter, projection) {
    const foundConfig = await TenantConfigDAO.findOne(filter, projection)
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
