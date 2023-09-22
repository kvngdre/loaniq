import jwt from "jsonwebtoken";

import { config } from "../../config/index.js";

export class JwtService {
  static generateAccessToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.ttl.access,
      issuer: config.jwt.issuer,
    });
  }

  static generateRefreshToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.ttl.refresh,
      issuer: config.jwt.issuer,
    });
  }
}
