import events from '../pubsub/events'
import pubsub from '../pubsub'
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

  async getAllConfigs (filter) {
    const foundUserConfigs = await UserConfigDAO.findAll(filter)
    const count = Intl.NumberFormat('en-US').format(foundUserConfigs.length)

    return [count, foundUserConfigs]
  }

  async getUserConfig (userId) {
    const foundUserConfig = await UserConfigDAO.findByField({ userId })

    return foundUserConfig
  }

  async updateConfig (userId, dto) {
    const updatedUserConfig = await UserConfigDAO.update({ userId }, dto)

    return updatedUserConfig
  }

  async deleteConfig (userId) {
    const deletedUserConfig = await UserConfigDAO.remove({ userId })

    return deletedUserConfig
  }
}

export default new UserConfigService()
