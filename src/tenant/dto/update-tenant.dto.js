import { CompanyCategory } from '../../utils/common';

/**
 * The result of validating the signup request payload.
 * @typedef UpdateTenantDto
 * @type {Object}
 * @property {string} [logo] url to the company logo.
 * @property {string} [business_name]
 * @property {string} [address]
 * @property {Object} [state] State object.
 * @property {string} state.code State code
 * @property {string} state.name State name
 * @property {string} state.lga Local Government Area
 * @property {string} state.geo Geopolitical zone
 * @property {CompanyCategory} [category] The tenant category.
 *
 */
