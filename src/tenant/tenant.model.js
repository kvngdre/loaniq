import { Schema, model } from 'mongoose';
import { TenantStatus, companyCategory } from '../utils/common.js';

const tenantSchema = new Schema(
  {
    logo: {
      type: String,
      default: null,
    },

    company_name: {
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
      enum: companyCategory,
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
