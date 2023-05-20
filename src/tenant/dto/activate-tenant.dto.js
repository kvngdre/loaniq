import { CompanyCategory } from '../../utils/common';

/**
 * An Item of the tenant configurations documentation array.
 * @typedef DocumentationItem
 * @type {Object}
 * @property {string} name The name of the document.
 * @property {string} type The name of the documentation
 * @property {string} url Url pointing to where the document is uploaded.
 * @property {string} [expires] The document expiration date if any.
 */

/**
 * The result of validating the signup request payload.
 * @typedef ActivateTenantDto
 * @type {Object}
 * @property {string} [logo] url to the company logo.
 * @property {string} address
 * @property {Object} state State object.
 * @property {string} state.code State code
 * @property {string} state.name State name
 * @property {string} state.lga Local Government Area
 * @property {string} state.geo Geopolitical zone
 * @property {string} cac_number The tenant business registration number.
 * @property {CompanyCategory} category The tenant category.
 * @property {Object} support
 * @property {string} support.email Tenant support email
 * @property {string} support.phone_number Tenant support phone_number
 * @property {Array.<DocumentationItem>} documentation
 *
 */
