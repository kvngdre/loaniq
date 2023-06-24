import { Schema, model } from 'mongoose';
import {
  STATUS,
  VALID_ID,
  companyCategory,
  tenantDocTypes,
} from '../utils/common.js';

const tenantSchema = new Schema(
  {
    logo: {
      type: String,
      default: null,
    },

    businessName: {
      type: String,
      required: true,
    },

    address: String,

    state: {
      type: {
        code: String,
        name: String,
        lga: String,
        geo: String,
      },
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

    email: String,

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.ONBOARDING,
    },

    identification: {
      type: [
        {
          name: { type: String, required: true },
          type: { type: String, enum: VALID_ID },
          url: { type: String, required: true },
        },
      ],
    },

    documentation: {
      type: [
        {
          name: { type: String, required: true },
          type: { type: String, enum: tenantDocTypes },
          url: { type: String, required: true },
          expires: { type: Date, default: null },
        },
      ],
    },

    configurations: {
      socials: {
        type: [
          {
            platform: { type: String, trim: true, required: true },
            url: { type: String, trim: true, required: true },
          },
        ],
      },

      support: {
        email: {
          type: String,
          trim: true,
          default: null,
        },

        phoneNo: {
          type: String,
          default: null,
        },
      },

      formId: {
        type: String,
        default: null,
      },

      formTheme: {
        backgroundColor: String,
        font: String,
        fontColor: String,
      },
    },
  },
  { timestamps: true },
);

export const Tenant = model('Tenant', tenantSchema);
