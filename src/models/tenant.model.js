import { get } from '../config'
import { sign } from 'jsonwebtoken'
import { Schema, model } from 'mongoose'

const schemaOptions = { timestamps: true, versionKey: false }

const tenantSchema = new Schema(
  {
    logo: {
      type: String,
      default: null
    },

    company_name: {
      type: String,
      unique: true,
      trim: true,
      required: true
    },

    location: {
      address: {
        type: String,
        trim: true,
        default: null
      },
      lga: {
        type: String,
        default: null
      },
      state: {
        type: String,
        default: null
      }
    },

    cac_number: {
      type: String,
      unique: true,
      sparse: true
    },

    // directors: [
    //     {
    //         name: {
    //             type: String
    //         },
    //         email: {
    //             type: String,
    //         },
    //         id: {
    //             type: String
    //         }
    //     }
    // ],

    category: {
      type: String,
      enum: ['MFB', 'Finance House', 'Money Lender']
    },

    phone_number: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },

    email: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    active: {
      type: Boolean,
      default: true
    },

    activated: {
      type: Boolean,
      default: false
    },

    otp: {
      pin: {
        type: String,
        default: null
      },

      exp: {
        type: Number,
        default: null
      }
    },

    website: {
      type: String,
      default: null,
      trim: true,
      lowercase: true
    },

    support: {
      email: {
        type: String,
        trim: true,
        default: null
      },

      phone: {
        type: String,
        default: null
      }
    },

    socials: {
      twitter: {
        url: {
          type: String,
          default: null
        },
        active: {
          type: Boolean,
          default: false
        }
      },
      instagram: {
        url: {
          type: String,
          default: null
        },
        active: {
          type: Boolean,
          default: false
        }
      },
      facebook: {
        url: {
          type: String,
          default: null
        },
        active: {
          type: Boolean,
          default: false
        }
      },
      whatsapp: {
        url: {
          type: String,
          default: null
        },
        active: {
          type: Boolean,
          default: false
        }
      },
      youtube: {
        url: {
          type: String,
          default: null
        },
        active: {
          type: Boolean,
          default: false
        }
      },
      tiktok: {
        url: {
          type: String,
          default: null
        },
        active: {
          type: Boolean,
          default: false
        }
      }
    }
  },
  schemaOptions
)

tenantSchema.methods.generateToken = function () {
  return sign(
    {
      tenantId: this._id.toString()
    },
    get('jwt.secret.access'),
    {
      audience: get('jwt.audience'),
      expiresIn: parseInt(get('jwt.expTime.form')),
      issuer: get('jwt.issuer')
    }
  )
}

const Tenant = model('Tenant', tenantSchema)

export default Tenant
