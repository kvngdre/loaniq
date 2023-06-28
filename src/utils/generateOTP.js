/**
 * Generates a random number string of specified length and expiration time.
 * @param {number} len The number of digits the otp should contain.
 * @param {number} expires OTP time-to-live in minutes.
 * @returns {{value: string, expires: number, ttl: number}}
 */
export default function generateOTP(len, ttl = 10) {
  if (typeof len !== "number" || typeof ttl !== "number") {
    throw new Error('Arguments must be of type "number"');
  }

  const value = `${Math.floor(Math.random() * 10 ** len)}`;
  const expires = Date.now() + ttl * 60 * 1_000;

  return { value, expires, ttl };
}
