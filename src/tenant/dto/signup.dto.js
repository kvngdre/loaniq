import mongoose from 'mongoose';
import { TenantStatus } from '../../utils/common';

/**
 * @typedef SignupDto
 * @type {Object}
 * @property {Object} newTenantDto
 * @property {mongoose.ObjectId} newTenantDto._id The generated tenant object id
 * @property {string} newTenantDto.business_name The name of the business
 * @property {TenantStatus} newTenantDto.status
 * @property {mongoose.ObjectId} newTenantDto.configurations Tenant configurations object id
 * @property {Object} newUserDto Transaction type
 * @property {mongoose.ObjectId} newUserDto._id The generated user object id
 * @property {string} newUserDto.first_name User first name
 * @property {string} newUserDto.last_name User last name
 * @property {string} newUserDto.email User email address
 * @property {string} newUserDto.phone_number User phone number
 * @property {mongoose.ObjectId} newUserDto.role User role object id
 * @property {Object} newUserDto.configurations User configurations
 * @property {string} newUserDto.configurations.password User password
 * @property {boolean} [newUserDto.configurations.resetPwd=false] Reset password flag
 * @property {Object} [newUserDto.configurations.otp={}]
 */
