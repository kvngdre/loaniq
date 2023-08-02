import bcrypt from "bcryptjs";

/**
 * Encrypts the users password
 * @param {string} password The user password
 * @returns {string}
 */
export default function encryptPassword(password) {
  return bcrypt.hashSync(password, 10);
}
