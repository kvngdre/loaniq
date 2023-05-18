import { Schema, model } from 'mongoose';
import { companyCategory, status, validIds } from '../utils/common.js';

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
      type: Schema.Types.ObjectId,
      ref: 'State',
    },

    cac_number: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },

    category: {
      type: String,
      enum: companyCategory,
    },

    status: {
      type: String,
      enum: Object.values(status),
      default: status.ONBOARDING,
    },

    activated: {
      type: Boolean,
      default: false,
    },

    documentation: {
      type: [
        {
          name: { type: String, required: true },
          type: { type: String, enum: validIds },
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
