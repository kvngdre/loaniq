/* eslint-disable no-param-reassign */
import { ValidationError } from "../../utils/errors/index.js";

export class TokenEntity {
  constructor(userId, type, token, expires) {
    this.userId = userId;
    this.type = type;
    this.value = token;
    this.expires = expires;
  }

  static make({ userId, type, token, expires, ttl = 10 }) {
    if (!token) {
      switch (type) {
        case "verify":
          token = `${Math.floor(Math.random() * 10 ** 5)}`;
          break;
        case "password":
          token = `${Math.floor(Math.random() * 10 ** 6)}`;
          break;
        default:
          throw new ValidationError("Invalid token type");
      }
    }

    if (!expires) {
      expires = Date.now() + ttl * 60 * 1_000;
    }

    return new TokenEntity(userId, type, token, expires);
  }
}
