/* eslint-disable camelcase */
import { txnTypes } from '../utils/constants'

const ONE_MINUTE_IN_MILLISECONDS = 60_000

/**
 * Generates a random string of characters of specified length.
 * @param {string} len The length of the string
 * @returns {string}
 */
export function genRandomStr (len = 5) {
  let randStr = ''
  const str =
    'ABCDEFGHJKMNOPQRSTUVWXYZ0123456789abcdefghjkmnopqrstuvwxyz9876543210'

  for (let i = 1; i <= len; i++) {
    const char = Math.floor(Math.random() * str.length)

    randStr += str.charAt(char)
  }
  return randStr
}

/**
 * Generates a random number string of specified length and expiration time.
 * @param {number} expiresIn OTP time-to-live in minutes.
 * @param {number} len The number of digits the otp should contain.
 * @returns {{pin, expires}}
 */
export function generateOTP (expiresIn = 5, len = 6) {
  const val1 = 10 ** (len - 1)
  const val2 = val1 * 9

  const pin = Math.floor(Math.random() * val2 + val1).toString()
  const expires = Date.now() + expiresIn * ONE_MINUTE_IN_MILLISECONDS

  return { pin, expires }
}

/**
 * Flattens a nested object.
 * @param {object} obj The nested object to flatten.
 * @param {object} newObj The target object.
 * @param {string} prefix
 * @returns {object}
 */
export function flatten (obj, newObj = {}, prefix = '') {
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      this.flatten(obj[key], newObj, prefix + key + '.')
    } else {
      newObj[prefix + key] = obj[key]
    }
  }
  return newObj
}

/**
 * Validates if the given otp matches and has not expired
 * @param {*} doc - The mongodb document that contains the otp
 * @param {string} otp - user provided otp
 * @returns {{isValid: boolean, message?: string}}
 */
export const validateOTP = (doc, otp) => {
  if (Date.now() > doc.otp.expiresIn) {
    return { isValid: false, message: 'OTP has expired.' }
  }

  if (otp !== doc.otp.pin) {
    return { isValid: false, message: 'Invalid OTP' }
  }

  return { isValid: true }
}

/**
 * Selects a random user for list of filtered users.
 * @param {string} tenantId
 * @param {string} role
 * @returns
 */

export class TxnObj {
  constructor ({
    tenantId,
    reference,
    status,
    type,
    purpose,
    desc,
    amount,
    balance,
    fees
  }) {
    this.tenantId = tenantId
    this.reference = reference
    this.status = status
    this.type = type
    this.purpose = purpose
    this.description = desc
    this.amount = amount
    this.fees = fees
    this.balance_before = balance
    this.balance_after =
      type === txnTypes.DEBIT ? balance - amount : balance + amount
  }
}
