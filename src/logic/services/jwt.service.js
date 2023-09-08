import jwt from "jsonwebtoken";

export class JwtService {
  static genAccessToken(payload) {
    jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_TTL,
      issuer: process.env.JWT_ISSUER,
    });
  }

  static genRefreshToken(payload) {
    jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_TTL,
      issuer: process.env.JWT_ISSUER,
    });
  }
}
