import { randomBytes } from "crypto";

/**
 * Generates a random number string of specified length and expiration time.
 * @param {number} len The number of digits the otp should contain.
 * @returns {string}
 */
export function generateOTP(len) {
  if (!len || typeof len !== "number") {
    throw new Error('Argument "len" must be of type "number"');
  }

  const code = randomBytes(4).readUIntBE(0, 4) % 10 ** len;
  return code.toString().padStart(len, "0");
}
