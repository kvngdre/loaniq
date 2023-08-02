import UserConfigDAO from "../daos/userConfig.dao.js";

class UserConfigService {
  static async createConfig(newUserConfigDTO, trx) {
    const newConfig = await UserConfigDAO.insert(newUserConfigDTO, trx);

    return newConfig;
  }

  static async getConfigs(filter) {
    const foundConfigs = await UserConfigDAO.find(filter);
    const count = Intl.NumberFormat("en-US").format(foundConfigs.length);

    return { count, foundConfigs };
  }

  static async getConfig(filter) {
    const foundConfig = await UserConfigDAO.findOne(filter);

    return foundConfig;
  }

  static async updateConfig(userId, dto) {
    const updatedConfig = await UserConfigDAO.update({ userId }, dto);

    return updatedConfig;
  }

  static async deleteConfig(userId) {
    const deletedConfig = await UserConfigDAO.remove({ userId });

    return deletedConfig;
  }
}

export default UserConfigService;
