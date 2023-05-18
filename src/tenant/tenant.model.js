import { Schema, model } from 'mongoose';
import { TenantStatus, VALID_ID, companyCategory } from '../utils/common.js';

const tenantSchema = new Schema(
  {
    logo: {
      type: String,
      default: null,
    },

    business_name: {
      type: String,
      unique: true,
      sparse: true,
      // required: true
    },

    address: {
      type: String,
      maxLength: 255,
      default: null,
    },

    state: {
      type: {
        code: String,
        name: String,
        lga: String,
        geo: String,
      },
    },

    cac_number: {
      type: String,
      unique: true,
      sparse: true,
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

    activated: {
      type: Boolean,
      default: false,
    },

    configurations: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant-Configuration',
    },

    documentation: {
      type: [
        {
          name: { type: String, required: true },
          type: { type: String, enum: VALID_ID },
          url: { type: String, required: true },
          expires: { type: Date, default: null },
        },
      ],
      default: null,
      select: false,
    },
  },
  { timestamps: true, versionKey: false },
);

const Tenant = model('Tenant', tenantSchema);

export default Tenant;
