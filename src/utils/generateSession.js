// In milliseconds
const tokenExpirationTime = process.env.JWT_REFRESH_TIME * 1_000;
export default function generateSession(token, ip) {
  return {
    ip,
    token,
    login_time: new Date(),
    expiresIn: Date.now() + tokenExpirationTime,
  };
}
