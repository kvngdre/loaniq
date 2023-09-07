import { Schema, model } from "mongoose";
import { feeTypes } from "../../utils/common.js";

const segConfigSchema = new Schema(
  {
    segment: {
      type: Schema.Types.ObjectId,
      ref: "Segment",
      required: true,
    },

    active: {
      type: Boolean,
      default: false,
    },

    max_age: {
      type: Number,
      required: true,
    },

    max_tenure: {
      type: Number,
      required: true,
    },

    min_loan_amount: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, "Minimum loan amount is required."],
    },

    max_loan_amount: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, "Maximum loan amount is required."],
    },

    min_tenor: {
      type: Number,
      required: [true, "Minimum tenor is required."],
    },

    max_tenor: {
      type: Number,
      required: [true, "Maximum tenor is required."],
    },

    interest_rate: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, "Interest rate is required."],
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

    min_income: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, "Minimum income is required."],
    },

    max_income: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, "Maximum income is required."],
    },

    max_dti: {
      type: Number,
      set: (v) => Math.floor(v * 100) / 100,
      required: [true, "Maximum DTI ratio is required."],
    },
  },
  { timestamps: true },
);

segConfigSchema.index({ segment: 1, min_income: 1 }, { unique: true });

// segConfigSchema.index({ min_net_pay: 1, tenantId: 1 }, { unique: true })

const SegmentConfig = model("Segment_Config", segConfigSchema);

export default SegmentConfig;
