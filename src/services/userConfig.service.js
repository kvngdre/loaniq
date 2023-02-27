import events from '../pubsub/events'
import pubsub from '../pubsub/PubSub'
import UserConfigDAO from '../daos/userConfig.dao'

class UserConfigService {
  constructor () {
    pubsub.subscribe(events.user.new, this.createConfig)
    pubsub.subscribe(events.user.login, this.updateUserSignIn)
    pubsub.subscribe(events.user.delete, this.deleteConfig)
  }

  async createConfig (newSettingsDto, trx) {
    const newSettings = await UserConfigDAO.insert(newSettingsDto, trx)

    return newSettings
  }

  async getAllConfigs () {
    const foundUserConfigs = await UserConfigDAO.findAll()
    const count = Intl.NumberFormat('en-US').format(foundUserConfigs.length)

    return [count, foundUserConfigs]
  }

  async getConfig ({ userId }) {
    const foundUserConfig = await UserConfigDAO.findByField({ userId })

    return foundUserConfig
  }

  async updateConfig ({ userId }, updateDto) {
    const updatedUserConfig = await UserConfigDAO.update({ userId }, updateDto)

    return updatedUserConfig
  }

  async updateUserSignIn ({ userId }) {
    const updatedSettings = await UserConfigDAO.update(
      { userId },
      {
        last_login_time: new Date()
      }
    )

    return updatedSettings
  }

  async deleteConfig ({ userId }) {
    const deletedUserConfig = await UserConfigDAO.remove({ userId })

    return deletedUserConfig
  }
}

export default new UserConfigService()
