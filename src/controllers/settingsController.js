import settingsService from '../services/settings.service'

class SettingsController {
  static async createSettings (newSettingsDto) {
    const newUSerSettings = await settingsService.createSettings(newSettingsDto)

    return newUSerSettings
  }
}

export default SettingsController
