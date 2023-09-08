import { config } from "../config/index.js";

// In milliseconds
const tokenExpirationTime = config.jwt.ttl.refresh * 1_000;

export function generateSession(refreshToken, agent, ip) {
  return {
    ip,
    agent,
    refreshToken,
    loginTime: new Date(),
    expiresIn: Date.now() + tokenExpirationTime,
  };
}
