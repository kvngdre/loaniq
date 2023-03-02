import { computeAge, computeTenure } from '../helpers'
import { loanStatus, maritalStatus, relationships, validIds } from '../utils/constants'
import Loan from './loanModel'
import { Schema, model } from 'mongoose'
import Segment from './segment.model'
const logger = require('../utils/logger')

const schemaOptions = { timestamps: true, versionKey: false }

const customerSchema = new Schema(
  {
    tenantId: {
      type: String,
      required: true
    },

    passport: {
      type: String,
      default: null
    },

    id_card: {
      type: String,
      default: null
    },

    name: {
      first: {
        type: String,
        minLength: 3,
        maxLength: 50,
        trim: true,
        required: true
      },

      last: {
        type: String,
        minLength: 3,
        maxLength: 50,
        trim: true,
        required: true
      },

      middle: {
        type: String,
        minLength: 3,
        maxLength: 50,
        trim: true
      }
    },

    gender: {
      type: String,
      enum: ['Male', 'Female'],
      required: true
    },

    birthDate: {
      type: Date,
      required: true
    },

    residentialAddress: {
      address: {
        type: String,
        trim: true,
        maxLength: 255,
        lowercase: true,
        required: true
      },

      state: {
        type: String,
        required: true
      },

      stateCode: {
        type: String,
        uppercase: true,
        required: true
      },

      lga: {
        type: String,
        required: true
      },

      geo: {
        type: String,
        required: true
      }
    },

    phone: {
      type: String,
      trim: true,
      required: true
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null
    },

    maritalStatus: {
      type: String,
      enum: maritalStatus,
      required: true
    },

    bvn: {
      type: String,
      trim: true,
      required: true
    },

    ippis: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
      validate: {
        validator: async function (ippis) {
          const foundSegment = await findOne({
            _id: this.employer.segment,
            active: true
          })
          if (!foundSegment) { return new ServerResponse('Segment not found') }

          const prefixMatch = ippis.match(/^[A-Z]{2,3}(?=[0-9])/)
          if (
            foundSegment.prefix !==
                        (prefixMatch == null ? prefixMatch : prefixMatch[0])
          ) { return false }

          return true
        },
        message: 'IPPIS number does not match segment selected'
      }
    },

    idType: {
      type: String,
      enum: validIds,
      required: true
    },

    idNo: {
      type: String,
      minLength: 4,
      maxLength: 50,
      trim: true,
      required: true
    },

    employer: {
      name: {
        type: String,
        minLength: 3,
        maxLength: 255,
        trim: true,
        required: true
      },

      command: {
        type: String,
        trim: true,
        default: null
      },

      segment: {
        type: Schema.Types.ObjectId,
        required: true
      },

      location: {
        address: {
          type: String,
          trim: true,
          maxLength: 255,
          lowercase: true,
          required: true
        },

        state: {
          type: String,
          required: true
        },

        lga: {
          type: String,
          required: true
        }
      },

      hireDate: {
        type: Date,
        required: true
      }
    },

    nok: {
      fullName: {
        type: String,
        trim: true,
        required: true
      },

      location: {
        address: {
          type: String,
          trim: true,
          maxLength: 255,
          lowercase: true,
          required: true
        },

        state: {
          type: String,
          required: true
        },
        lga: {
          type: String,
          required: true
        }
      },

      phone: {
        type: String,
        trim: true,
        required: true
      },

      relationship: {
        type: String,
        enum: relationships,
        required: true
      }
    },

    accountName: {
      type: String,
      lowercase: true,
      required: true,
      trim: true
    },

    accountNo: {
      type: String,
      trim: true,
      required: true
    },

    bank: {
      name: {
        type: String,
        required: true
      },

      code: {
        type: String,
        maxLength: 6,
        required: true
      }
    },

    // below are set programmatically. No user can edit.
    netPay: {
      type: Number,
      default: 80_000.27
    },

    validBvn: {
      type: Boolean
    },

    validAccNo: {
      type: Boolean
    }
  },
  schemaOptions
)

// ! Creating compound indexes
customerSchema.index({ ippis: 1, tenantId: 1 }, { unique: true })
customerSchema.index({ bvn: 1, tenantId: 1 }, { unique: true })
customerSchema.index({ accountNo: 1, tenantId: 1 }, { unique: true })

customerSchema.virtual('full_name').get(function () {
  return this.first_name.concat(
    this.middle_name ? ` ${this.middle_name}` : '',
    ` ${this.last_name}`
  )
})

// customerSchema.methods = function runCalulations () {}

customerSchema.pre('save', async function (next) {
  try {
    const isPresent = (path) =>
      ['birthDate', 'employer.hireDate'].includes(path)
    if (this.modifiedPaths().some(isPresent)) {
      console.log('triggered')
      const age = computeAge(this.birthDate)
      const serviceLen = computeTenure(this.employer.hireDate)
      await updateMany(
        {
          customer: this._id,
          status: loanStatus.pending
        },
        {
          'params.age': age,
          'params.serviceLen': serviceLen
        }
      )
    }

    next()
  } catch (exception) {
    logger.error({
      method: 'customer_pre_save',
      message: exception.message,
      meta: exception.meta
    })
    debug(exception)
    next(new ServerResponse(500, 'Something went wrong'))
  }
})

const Customer = model('Customer', customerSchema)

export default Customer
