/**
 * Flattens a nested object.
 * @param {object} obj The nested object to flatten.
 * @param {object} newObj The target object.
 * @param {string=''} prefix
 * @returns {object}
 */
export function flatten(obj, newObj = {}, prefix = '') {
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      this.flatten(obj[key], newObj, `${prefix + key}.`);
    } else {
      newObj[prefix + key] = obj[key];
    }
  }
  return newObj;
}
