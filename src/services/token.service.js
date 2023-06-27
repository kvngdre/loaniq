export class TokenService {
  static generateToken(len, ttl = 10) {
    if (typeof len !== "number" || typeof ttl !== "number") {
      throw new Error('Arguments must be of type "number"');
    }

    const value = `${Math.floor(Math.random() * 10 ** len)}`;
    const expiresIn = Date.now() + ttl * 60 * 1_000;

    return { value, expiresIn };
  }
}
