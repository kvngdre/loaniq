import events from '../pubsub/events'
import pubsub from '../pubsub/pubsub'
import UserConfigDAO from '../daos/userConfig.dao'

class UserConfigService {
  constructor () {
    pubsub.subscribe(events.user.new, this.createConfig)
    pubsub.subscribe(events.user.login, this.updateConfig)
    pubsub.subscribe(events.user.delete, this.deleteConfig)
  }

  async createConfig (dto, trx) {
    const newConfig = await UserConfigDAO.insert(dto, trx)

    return newConfig
  }

  async getConfigs (filter) {
    const foundConfigs = await UserConfigDAO.findAll(filter)
    const count = Intl.NumberFormat('en-US').format(foundConfigs.length)

    return [count, foundConfigs]
  }

  async getConfig (filter) {
    const foundConfig = await UserConfigDAO.findByField(filter)

    return foundConfig
  }

  async updateConfig (filter, dto) {
    const updatedConfig = await UserConfigDAO.update(filter, dto)

    return updatedConfig
  }

  async deleteConfig (filter) {
    const deletedConfig = await UserConfigDAO.remove(filter)

    return deletedConfig
  }
}

export default new UserConfigService()
