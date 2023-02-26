import { Schema, model } from 'mongoose'
import { calcDti, calcNetValue, calcRepayment, calcTotalRepayment, calcUpfrontFee } from '../utils/loanParamFuncs'
import { loanStatus, loanRemarks } from '../utils/constants'
import ServerError from '../errors/serverError'
const logger = require('../utils/logger')

const schemaOptions = { timestamps: true, versionKey: false }

const loanSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true
    },

    recommendedAmount: {
      type: Number,
      default: (self = this) => self.amount
    },

    amountInWords: {
      type: String,
      trim: true,
      lowercase: true,
      required: true
    },

    tenor: {
      type: Number,
      required: true
    },

    recommendedTenor: {
      type: Number,
      default: (self = this) => self.tenor
    },

    loanType: {
      type: String,
      enum: ['New', 'Top Up'],
      default: 'New'
    },

    status: {
      type: String,
      enum: Object.values(loanStatus),
      default: loanStatus.pending
    },

    remark: {
      type: String,
      enum: loanRemarks
    },

    upfrontFee: {
      type: Number
    },

    netValue: {
      type: Number,
      default: null
    },

    repayment: {
      type: Number
    },

    totalRepayment: {
      type: Number
    },

    dti: {
      type: Number,
      default: null
    },

    customer: {
      type: Schema.Types.ObjectId,
      required: true
    },

    creditUser: {
      type: Schema.Types.ObjectId,
      required: true
    },

    agent: {
      type: Schema.Types.ObjectId,
      required: true
    },

    active: {
      type: Boolean,
      default: false
    },

    params: {
      interestRate: {
        type: Number,
        required: true
      },

      upfrontFeePercent: {
        type: Number,
        require: true
      },

      transferFee: {
        type: Number,
        required: true
      },

      maxDti: {
        type: Number,
        required: true
      },

      minNetPay: {
        type: Number,
        required: true
      },

      netPay: {
        type: Number
      },

      age: {
        type: Number,
        default: null
      },

      serviceLen: {
        type: Number,
        default: null
      }
    },

    approveDenyDate: {
      type: Date,
      default: null
    },

    dateLiquidated: {
      type: Date,
      default: null
    },

    maturityDate: {
      type: String,
      default: null
    },

    isBooked: {
      type: Boolean,
      default: false
    },

    isDisbursed: {
      type: Boolean,
      default: false
    },

    isLocked: {
      type: Boolean,
      default: false
    }
  },
  schemaOptions
)

loanSchema.pre('save', function (next) {
  try {
    const isPresent = (path) => ['amount', 'tenor'].includes(path)
    if (this.modifiedPaths().some(isPresent)) {
      this.recommendedAmount = this.amount
      this.recommendedTenor = this.tenor
    }

    // setting loan metrics
    const hasTrigger = (path) =>
      ['recommendedAmount', 'recommendedTenor'].includes(path)
    if (this.modifiedPaths().some(hasTrigger)) {
      console.log('yes')

      this.upfrontFee = calcUpfrontFee(
        this.recommendedAmount,
        this.params.upfrontFeePercent
      )

      this.netValue = calcNetValue(
        this.recommendedAmount,
        this.upfrontFee,
        this.params.transferFee
      )

      this.repayment = calcRepayment(
        this.recommendedAmount,
        this.params.interestRate,
        this.recommendedTenor
      )

      this.totalRepayment = calcTotalRepayment(
        this.repayment,
        this.recommendedTenor
      )

      this.dti = calcDti(this.repayment, this.params.netPay)
    }

    next()
  } catch (exception) {
    logger.error({
      method: 'loan_pre_save',
      message: exception.message,
      meta: exception.meta
    })
    next(new ServerError(500, 'Something went wrong'))
  }
})

const Loan = model('Loan', loanSchema)

export default Loan
