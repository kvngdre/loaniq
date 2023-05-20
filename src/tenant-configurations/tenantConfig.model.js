import { Schema, model } from 'mongoose';
import { FeeType, TenantDocumentationTypes } from '../utils/common.js';
import { ValidId } from '../utils/constants.utils.js';

const tenantConfigurationSchema = new Schema(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      unique: true,
      required: true,
    },

    documentation: {
      type: [
        {
          name: { type: String, required: true },
          type: {
            type: String,
            enum: Object.values(TenantDocumentationTypes),
            required: true,
          },
          url: { type: String, required: true },
          expires: { type: Date, default: null },
        },
      ],
      default: null,
      select: false,
    },

    passwordResetFrequency: {
      // In days
      type: Number,
      default: null,
    },

    allowUserPwdReset: {
      type: Boolean,
      default: false,
    },

    default_params: {
      min_loan_amount: {
        type: Number,
        default: null,
      },

      max_loan_amount: {
        type: Number,
        default: null,
      },

      min_tenor: {
        // In  months
        type: Number,
        default: null,
      },

      max_tenor: {
        // In months
        type: Number,
        default: null,
      },

      interest_rate: {
        type: Number,
        default: null,
      },

      max_dti: {
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
          enum: Object.values(FeeType),
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
          platform: { type: String, trim: true, requird: true },
          link: { type: String, trim: true, required: true },
        },
      ],
    },

    support: {
      email: {
        type: String,
        trim: true,
        default: null,
      },

      phone_number: {
        type: String,
        default: null,
      },
    },

    formId: {
      type: String,
      unique: true,
      sparse: true,
    },

    form_theme: {
      background_color: String,
      font: String,
      fontColor: String,
    },

    reset_period: {
      type: Number,
    },
  },
  { timestamps: true, versionKey: false },
);

const TenantConfiguration = model(
  'Tenant-Configuration',
  tenantConfigurationSchema,
);

export default TenantConfiguration;
