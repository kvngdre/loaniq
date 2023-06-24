import { Schema, model } from 'mongoose';
import { companyCategory, status, validIds } from '../utils/common.js';

const tenantSchema = new Schema(
  {
    logo: {
      type: String,
      default: null,
    },

    businessName: {
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

    cacNumber: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },

    category: {
      type: String,
      enum: companyCategory,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
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
    },
  },
  { timestamps: true },
);

export const Tenant = model('Tenant', tenantSchema);
