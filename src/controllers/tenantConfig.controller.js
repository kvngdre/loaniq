import tenantConfigService from '../services/tenantConfig.service'

class TenantConfigController {
  static async createConfigurations (newConfigDto) {
    const newTenantConfigurations = await tenantConfigService.createConfig(
      newConfigDto
    )
    return newTenantConfigurations
  }

  static async getConfigurations () {
    const foundTenantConfigurations = await tenantConfigService.getConfigs()

    return foundTenantConfigurations
  }
}

export default TenantConfigController
