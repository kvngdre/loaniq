import { Schema, model } from 'mongoose';
// import { computeDTI, applyFees, computeRepaymentSet } from '../helpers'
import NotFoundError from '../errors/notFound.error.js';
import { loanRemarks, loanStatus } from '../utils/common.js';
import logger from '../utils/logger.js';

const schemaOptions = { timestamps: true, versionKey: false };

const loanSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },

    active: {
      type: Boolean,
      default: false,
    },

    amount: {
      type: Number,
      required: true,
    },

    proposed_amount: {
      type: Number,
      default: (self = this) => self.amount,
    },

    amount_in_words: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },

    tenor: {
      type: Number,
      required: true,
    },

    proposed_tenor: {
      type: Number,
      default: (self = this) => self.tenor,
    },

    isTopUp: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: Object.values(loanStatus),
      default: loanStatus.PENDING,
    },

    remark: {
      type: String,
      enum: loanRemarks,
    },

    upfront_fee: Number,

    net_value: Number,

    repayment: Number,

    total_repayment: Number,

    dti: Number,

    analyst: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    agent: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    params: {
      interest_rate: {
        type: Number,
        required: true,
      },

      fees: {
        type: [Schema.Types.Mixed],
        default: null,
      },

      max_dti: {
        type: Number,
        required: true,
      },

      min_income: {
        type: Number,
        required: true,
      },

      income: {
        type: Number,
        required: true,
      },

      age: Number,

      tenure: Number,
    },

    date_approved_or_denied: Date,

    date_liquidated: Date,

    maturity_date: Date,

    isBooked: {
      type: Boolean,
      default: false,
    },

    isDisbursed: {
      type: Boolean,
      default: false,
    },

    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  schemaOptions,
);

loanSchema.pre('save', function (next) {
  try {
    const isPresent = (path) => ['amount', 'tenor'].includes(path);
    if (this.modifiedPaths().some(isPresent)) {
      this.proposed_amount = this.amount;
      this.proposed_tenor = this.tenor;
    }

    // setting loan metrics
    const hasTrigger = (path) =>
      ['recommendedAmount', 'recommendedTenor'].includes(path);
    if (this.modifiedPaths().some(hasTrigger)) {
      console.log('yes');

      // this.upfrontFee = calcUpfrontFee(
      //   this.recommendedAmount,
      //   this.params.upfrontFeePercent
      // )

      // this.netValue = applyFees(
      //   this.recommendedAmount,
      //   this.upfrontFee,
      //   this.params.transferFee
      // )

      // this.repayment = calcRepayment(
      //   this.recommendedAmount,
      //   this.params.interestRate,
      //   this.recommendedTenor
      // )

      // this.totalRepayment = calcTotalRepayment(
      //   this.repayment,
      //   this.recommendedTenor
      // )

      // this.dti = calcDti(this.repayment, this.params.netPay)
    }

    next();
  } catch (exception) {
    logger.error(exception.message, exception.meta);
    next(new Error(500, 'Something went wrong'));
  }
});

loanSchema.post(/^find/, function (doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('Loans not found.');
  }

  if (!doc) throw new NotFoundError('Loan not found.');
});

const Loan = model('Loan', loanSchema);

export default Loan;
