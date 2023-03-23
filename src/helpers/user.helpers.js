import logger from '../utils/logger'
import UserService from '../services/user.service'
import TenantService from '../services/tenant.service'

export const canUserResetPwd = async (userEmail) => {
  const { tenantId } = await UserService.getUser({ email: userEmail })
  const { allowUserPwdReset } = await TenantService.getConfig({
    tenantId
  })

  return allowUserPwdReset
}

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
