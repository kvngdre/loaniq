import { Schema, model } from "mongoose";

import { TenantStatus } from "../constants/tenant-status.constant.js";

export const tenantSchema = new Schema(
  {
    logo: {
      type: String,
      default: null,
    },

    name: {
      type: String,
      required: true,
      unique: true,
    },

    address: String,

    state: {
      type: String,
    },

    cacNumber: {
      type: String,
      default: null,
      sparse: true,
    },

    category: {
      type: String,
    },

    status: {
      type: String,
      default: TenantStatus.AWAITING_ACTIVATION,
    },

    documentation: {
      type: [
        {
          name: { type: String, required: true },
          type: { type: String, required: true },
          url: { type: String, required: true },
          expires: { type: Date, default: null },
        },
      ],
    },

    configurations: {
      allowUserPasswordReset: {
        type: Boolean,
        default: false,
      },

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
            required: true,
          },

          value: {
            type: Number,
            // set: (v) => Math.floor(v * 100) / 100,
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
          default: null,
        },

        phone: {
          type: String,
          default: null,
        },
      },

      form: {
        type: {
          id: {
            type: String,
            default: null,
          },

          background: {
            type: String,
          },

          font: {
            type: String,
          },

          color: {
            type: String,
          },
        },
      },
    },
  },
  { timestamps: true },
);

export const Tenant = model("Tenant", tenantSchema);
