// import { UserConfigRepo } from "../data/repositories/index.js";

// class UserConfigService {
//   static async createConfig(newUserConfigDTO, trx) {
//     const newConfig = await UserConfigRepo.insert(newUserConfigDTO, trx);

//     return newConfig;
//   }

//   static async getConfigs(filter) {
//     const foundConfigs = await UserConfigRepo.find(filter);
//     const count = Intl.NumberFormat("en-US").format(foundConfigs.length);

//     return { count, foundConfigs };
//   }

//   static async getConfig(filter) {
//     const foundConfig = await UserConfigRepo.findOne(filter);

//     return foundConfig;
//   }

//   static async updateConfig(userId, dto) {
//     const updatedConfig = await UserConfigRepo.update({ userId }, dto);

//     return updatedConfig;
//   }

//   static async deleteConfig(userId) {
//     const deletedConfig = await UserConfigRepo.remove({ userId });

//     return deletedConfig;
//   }
// }

// export default UserConfigService;
