// In milliseconds
const tokenExpirationTime = process.env.JWT_REFRESH_TIME * 1_000;

export function generateSession(refreshToken, agent, ip) {
  return {
    ip,
    agent,
    refreshToken,
    loginTime: new Date(),
    expiresIn: Date.now() + tokenExpirationTime,
  };
}
