import mongoose from 'mongoose';
import { TenantStatus } from '../../utils/common';

/**
 * @typedef NewTenantDto
 * @type {Object}
 * @property {mongoose.ObjectId} _id The generated tenant object id
 * @property {string} business_name The name of the business
 * @property {TenantStatus} tenant.status
 * @property {mongoose.ObjectId} tenant.configurations Tenant configurations object id
 */
