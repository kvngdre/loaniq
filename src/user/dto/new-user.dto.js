import mongoose from 'mongoose';

/**
 * @typedef NewUserDto
 * @type {Object}
 * @property {mongoose.ObjectId} _id The generated user object id
 * @property {string} first_name User first name
 * @property {string} last_name User last name
 * @property {string} email User email address
 * @property {string} phone_number User phone number
 * @property {mongoose.ObjectId} role User role object id
 * @property {Object} configurations User configurations
 * @property {string} configurations.password User password
 * @property {boolean} [configurations.resetPwd=false] Reset password flag
 * @property {Object} [configurations.otp={}]
 */
