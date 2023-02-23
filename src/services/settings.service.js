import { tenant } from '../pubsub/events'
import { subscribe } from '../pubsub/PubSub'
import { insert } from '../daos/config.dao'

class SettingsService {
  constructor () {
    subscribe(tenant.signUp, this.createSettings)
  }

  async createSettings (newSettingsDto, trx) {
    const newSettings = await insert(newSettingsDto, trx)

    return newSettings
  }
}

export default new SettingsService()
