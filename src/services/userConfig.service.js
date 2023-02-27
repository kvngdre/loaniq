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
    const foundSettings = await UserConfigDAO.findAll()
    const count = Intl.NumberFormat('en-US').format(foundSettings.length)

    return { count, foundSettings }
  }

  async getConfig ({ userId }) {
    const foundSettings = await UserConfigDAO.findByField({ userId })

    return foundSettings
  }

  async updateConfig ({ userId }, updateDto) {
    const updatedSettings = await UserConfigDAO.update({ userId }, updateDto)

    return updatedSettings
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
    const deletedSettings = await UserConfigDAO.remove({ userId })

    return deletedSettings
  }
}

export default new UserConfigService()
