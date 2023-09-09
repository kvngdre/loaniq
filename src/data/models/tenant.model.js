import { Schema } from "mongoose";
import { companyCategory, feeTypes } from "../../utils/common.js";
import {
  DOCUMENTATION_TYPE,
  TENANT_STATUS,
  VALID_ID,
} from "../../utils/helpers/index.js";

export const tenantSchema = new Schema(
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
      default: null,
    },

    category: {
      type: String,
      enum: companyCategory,
    },

    status: {
      type: String,
      enum: Object.values(TENANT_STATUS),
      default: TENANT_STATUS.AWAITING_ACTIVATION,
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
          type: { type: String, enum: DOCUMENTATION_TYPE },
          url: { type: String, required: true },
          expires: { type: Date, default: null },
        },
      ],
    },

    configurations: {
      defaultParams: {
        minLoanAmount: {
          type: Number,
          default: null,
        },

        maxLoanAmount: {
          type: Number,
          default: null,
        },

        minTenor: {
          // In  months
          type: Number,
          default: null,
        },

        maxTenor: {
          // In months
          type: Number,
          default: null,
        },

        interestRate: {
          type: Number,
          default: null,
        },

        maxDti: {
          type: Number,
          default: null,
        },
      },

      fees: [
        {
          name: {
            type: String,
            required: true,
          },

          type: {
            type: String,
            enum: Object.values(feeTypes),
            required: true,
          },

          value: {
            type: Number,
            set: (v) => Math.floor(v * 100) / 100,
            required: true,
          },
        },
      ],

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

        phone: {
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
