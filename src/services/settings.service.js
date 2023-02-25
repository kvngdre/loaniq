import events from '../pubsub/events'
import pubsub from '../pubsub/PubSub'
import SettingsDAO from '../daos/settings.dao'

class SettingsService {
  constructor () {
    pubsub.subscribe(events.user.new, this.createSettings)
    pubsub.subscribe(events.user.login, this.updateUserSignIn)
  }

  async createSettings (newSettingsDto, trx) {
    const newSettings = await SettingsDAO.insert(newSettingsDto, trx)

    return newSettings
  }

  async getAllSettings () {
    const foundSettings = await SettingsDAO.findAll()
    const count = Intl.NumberFormat('en-US').format(foundSettings.length)

    return { count, foundSettings }
  }

  async getOneSetting (settingsId) {
    const foundSettings = await SettingsDAO.findById(settingsId)

    return foundSettings
  }

  async updateSettings (settingsId, updateDto) {
    const updatedSettings = await SettingsDAO.update(settingsId, updateDto)

    return updatedSettings
  }

  async updateUserSignIn (query) {
    const updatedSettings = await SettingsDAO.update(query, {
      last_login_time: new Date()
    })

    return updatedSettings
  }

  async deleteSettings (settingsId) {
    const deletedSettings = await SettingsDAO.update(settingsId)

    return deletedSettings
  }
}

export default new SettingsService()
