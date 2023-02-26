export const userRoles = {
  ADMIN: 'E4',
  AGENT: 'Y5',
  ANALYST: 'R3',
  MASTER: 'Z0',
  OPERATIONS: 'T6',
  OWNER: 'W1',
  S_ADMIN: 'Q2',
  SUPPORT: 'U8'
}

/**
 * Returns an array of keys from userRole object that matches input role values.
 * @param {string | string[]} roles - The user roles to get keys for.
 * @returns {string[]} - an array containing the found keys.
 */
export const getUserRoleKeys = (roles) => {
  if (!Array.isArray) roles = [roles]

  return Object.entries(userRoles).reduce((foundKeys, arr) => {
    if (roles.includes(arr[1])) foundKeys.push(arr[0])

    return foundKeys
  }, [])
}
