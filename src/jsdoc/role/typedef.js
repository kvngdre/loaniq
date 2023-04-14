/**
 * @typedef RoleAdd
 * @type {Object}
 * @property {ObjectId} tenantId The tenant id
 * @property {boolean} [isDefault=false] If the role is a default or not
 * @property {string} name The role name
 * @property {string} [description] The role description
 * @property {ObjectId[]} permissions The permissions granted to the role
 */
