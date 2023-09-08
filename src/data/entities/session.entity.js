import { config } from "../../config/index.js";
import { ValidationError } from "../../utils/errors/index.js";

export class SessionEntity {
  constructor(userId, ip, agent, refreshToken, expiresIn, loginTime) {
    this.userId = userId;
    this.sessions = [
      {
        ip,
        agent,
        refreshToken,
        expiresIn,
        loginTime,
      },
    ];
  }

  static make({
    userId,
    ip,
    agent,
    refreshToken,
    expiresIn = Date.now() + config.jwt.ttl.refresh * 1_000,
    loginTime = new Date(),
  }) {
    if (!userId) {
      throw new ValidationError("Session must have a user id");
    }

    return new SessionEntity(
      userId,
      ip,
      agent,
      refreshToken,
      expiresIn,
      loginTime,
    );
  }
}
