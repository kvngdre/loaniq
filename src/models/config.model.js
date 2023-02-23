import { Schema, model } from 'mongoose'

const schemaOptions = { timestamps: true, versionKey: false }

const configSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      unique: true,
      required: true
    },

    public_url: {
      type: String,
      unique: true,
      sparse: true
    },

    default_params: {
      min_loan_amount: {
        type: Number,
        default: null
      },

      max_loan_amount: {
        type: Number,
        default: null
      },

      min_tenor: {
        type: Number,
        default: null
      },

      max_tenor: {
        type: Number,
        default: null
      },

      interest_rate: {
        type: Number,
        default: null
      },

      mgt_fee_percent: {
        type: Number,
        default: null
      },

      transfer_fee: {
        type: Number,
        default: null
      },

      min_net_pay: {
        type: Number,
        default: null
      },

      max_dti: {
        type: Number,
        default: null
      }
    },

    segments: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          unique: true,
          sparse: true
        },

        min_loan_amount: {
          type: Number,
          default: null
        },

        max_loan_amount: {
          type: Number,
          default: null
        },

        min_tenor: {
          type: Number,
          default: null
        },

        max_tenor: {
          type: Number,
          default: null
        },

        interest_rate: {
          type: Number,
          default: null
        },

        mgt_fee_percent: {
          type: Number,
          default: null
        },

        transfer_fee: {
          type: Number,
          default: null
        },

        min_net_pay: {
          type: Number,
          default: null
        },

        max_dti: {
          type: Number,
          default: null
        }
      }
    ]
  },
  schemaOptions
)

const Config = model('Config', configSchema)

export default Config
