/* eslint-disable no-param-reassign */
import { ValidationError } from "../../utils/errors/index.js";
import { TOKEN_TYPES } from "../../utils/helpers/token.helper.js";
import { generateOTP } from "../../utils/index.js";

export class TokenEntity {
  constructor(userId, type, token, expires) {
    this.userId = userId;
    this.type = type;
    this.value = token;
    this.expires = expires;
  }

  static make({
    userId,
    type,
    token = undefined,
    expires = undefined,
    ttl = 10,
  }) {
    if (!token) {
      switch (type) {
        case TOKEN_TYPES.VERIFY:
          token = generateOTP(5);
          break;
        case TOKEN_TYPES.RESET_PWD:
          token = generateOTP(6);
          break;
        default:
          throw new ValidationError("Invalid Token Type");
      }
    }

    if (!expires) {
      expires = Date.now() + ttl * 60 * 1_000;
    }

    return new TokenEntity(userId, type, token, expires);
  }
}
