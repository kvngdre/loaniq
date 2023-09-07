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
    const expiresIn = Date.now() + ttl * 60 * 1_000;

    return { value, expiresIn, ttl };
  }
}
