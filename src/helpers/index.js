/* eslint-disable camelcase */
import { txnTypes } from '../utils/constants'
import logger from '../utils/logger'
import UserService from '../services/user.service'
import UnauthorizedError from '../errors/UnauthorizedError'
import TenantService from '../services/tenant.service'

const ONE_MINUTE_IN_MILLISECONDS = 60_000
const epochYear = 1970

function editDistance (s1, s2) {
  s1 = s1.toLowerCase()
  s2 = s2.toLowerCase()

  const costs = []
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j
      else {
        if (j > 0) {
          let newValue = costs[j - 1]
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
          }
          costs[j - 1] = lastValue
          lastValue = newValue
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }
  return costs[s2.length]
}

/**
 * Calculates the percentage similarity between two strings.
 * @param {string} s1  The string to compare.
 * @param {string} s2  The string to compare.
 * @returns {number}  percentage similarity
 */
export function similarity (s1, s2) {
  let longer = s1
  let shorter = s2
  if (s1.length < s2.length) {
    longer = s2
    shorter = s1
  }
  const longerLength = longer.length
  if (longerLength === 0) {
    return 1.0
  }
  return (
    (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength)
  )
}

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
 * Selects a random user for list of filtered users.
 * @param {string} tenantId
 * @param {string} role
 * @returns
 */
export async function pickRandomUser (tenantId, role) {
  const foundUsers = await UserService.getUsers({
    tenantId,
    role,
    active: true,
    resetPwd: false
  }).catch((err) => {
    logger.warn(err.message, err.stack)
    return null
  })

  const idx = Math.floor(Math.random() * foundUsers.length)
  return foundUsers[idx]
}

/**
 * Computes person age
 * @param {string} dob Date of birth in ISO 8601 format.
 * @returns {number}
 */
export const computeAge = (dob) => {
  const diff = Date.now() - new Date(dob).getTime()
  const age = new Date(diff).getUTCFullYear() - epochYear

  return age
}

/**
 * Computes employment tenure.
 * @param {string} doe Date of employment in ISO 8601 format.
 * @returns {number}
 */
export const computeTenure = (doe) => {
  const diff = Date.now() - new Date(doe).getTime()
  const tenure = new Date(diff).getUTCFullYear() - 1970

  return tenure
}

/**
 * Applies all fees to loan.
 * @param {number} amount The recommended loan amount.
 * @param  {array} fees The fees to be applied.
 * @returns {number} Net value after all deductions.
 */
export const applyFees = (amount, fees) => {
  function reducer (acc, fee) {
    const value = fee.type === 'percent' ? fee.value / 100 : fee.value

    return acc - value
  }
  const netValue = fees.reduce(reducer, amount)

  return parseFloat(netValue.toFixed(2))
}

/**
 * Computes the repayment and total repayment.
 * @param {number} amount The loan amount.
 * @param {number} interestRate The interest rate.
 * @param {number} tenor The loan tenor.
 * @returns {number[]}
 */
export const computeRepaymentSet = (amount, interestRate, tenor) => {
  const repayment = (amount * (interestRate / 100) + amount / tenor).toFixed(2)
  const totalRepayment = (repayment * tenor).toFixed(2)

  return [parseFloat(repayment), parseFloat(totalRepayment)]
}

/**
 *  Calculates the Deb-to-Income ratio.
 * @param {number} repayment The monthly repayment value.
 * @param {number} income The loanee's monthly income.
 * @returns {number}
 */
export const computeDTI = (repayment, income) => {
  const dti = (repayment / income) * 100

  return parseFloat(dti.toFixed(2))
}

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

export const validateOTP = (user, otp) => {
  if (otp !== user.otp.pin) {
    throw new UnauthorizedError('Invalid OTP.')
  }

  if (Date.now() > user.otp.expires) {
    throw new UnauthorizedError('OTP has expired.')
  }
}

export const canUserResetPwd = async (userEmail) => {
  const { tenantId } = await UserService.getUser({ email: userEmail })
  const { allowUserPwdReset } = await TenantService.getConfig({
    tenantId
  })

  return allowUserPwdReset
}
