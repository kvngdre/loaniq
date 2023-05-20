import { Schema, model } from 'mongoose';
import { CompanyCategory, TenantStatus } from '../utils/common.js';

/**
 * @constructor
 */
export const tenantSchema = new Schema(
  {
    logo: {
      type: String,
      default: null,
    },

    business_name: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      maxLength: 255,
      default: null,
    },

    state: {
      type: {
        code: { type: String, default: null },
        name: { type: String, default: null },
        lga: { type: String, default: null },
        geo: { type: String, default: null },
      },
    },

    cac_number: {
      type: String,
      default: null,
    },

    category: {
      type: String,
      enum: CompanyCategory,
    },

    status: {
      type: String,
      enum: Object.values(TenantStatus),
      default: TenantStatus.ONBOARDING,
    },

    isActivated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

const Tenant = model('Tenant', tenantSchema);

export default Tenant;
