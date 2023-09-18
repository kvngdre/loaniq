import { TokenRepository } from "../../data/repositories/index.js";

export class TokenService {
  static async create(createTokenDto, session) {
    return TokenRepository.insert(createTokenDto, session);
  }

  static async findByTokenAndValidate(token, type) {
    const foundToken = await TokenRepository.findOne({ value: token, type });
    if (!foundToken || token !== foundToken.value) {
      return { isValid: false, reason: "Invalid Token" };
    }

    if (Date.now() > foundToken.expires) {
      return { isValid: false, reason: "Token Expired" };
    }

    return { isValid: true, reason: null };
  }

  static async upsert(upsertTokenDto, session) {
    return TokenRepository.upsert(upsertTokenDto, session);
  }

  static async deleteOne(filter, session) {
    return TokenRepository.deleteOne(filter, session);
  }
}
