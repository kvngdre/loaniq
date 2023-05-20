import { HydratedDocument } from 'mongoose';
import { CompanyCategory, TenantStatus } from '../../utils/common';

/**
 * The result of validating the signup request payload.
 * @typedef Tenant
 * @type {Object}
 * @property {string} [logo] url to the company logo.
 * @property {string} company_name
 * @property {string} [address]
 * @property {Object} [state] State object.
 * @property {string} state.code State code
 * @property {string} state.name State name
 * @property {string} state.lga Local Government Area
 * @property {string} state.geo Geopolitical zone
 * @property {string} [cac_number] The tenant CAC number.
 * @property {CompanyCategory} category The tenant category.
 * @property {TenantStatus} status status of the tenant.
 *
 */

/**
 * Mongoose tenant document
 * @typedef {HydratedDocument<Tenant>} TenantDocument
 */
