import { TokenRepository } from "../../data/repositories/index.js";

export class TokenService {
  /**
   * Generates a random number string of specified length and expiration time.
   * @param {number} len The number of digits the otp should contain.
   * @param {number} ttl OTP time-to-live in minutes.
   * @returns {{value: string, expires: number, ttl: number}}
   */
  static generateToken(len, ttl = 10) {
    if (typeof len !== "number" || typeof ttl !== "number") {
      throw new Error('Arguments must be of type "number"');
    }

    const value = `${Math.floor(Math.random() * 10 ** len)}`;
    const expires = Date.now() + ttl * 60 * 1_000;

    return { value, expires, ttl };
  }

  static async create(createTokenDto, session) {
    return TokenRepository.insert(createTokenDto, session);
  }

  static async findByTokenAndValidate(token) {
    const foundToken = await TokenRepository.findOne({ token });
    if (!foundToken || token !== foundToken.token) {
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
