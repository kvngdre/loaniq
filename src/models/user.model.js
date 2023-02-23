import { roles } from '../utils/constants'
import { hashSync, compare } from 'bcrypt'
import { get } from '../config'
import { sign } from 'jsonwebtoken'
import { Schema, model } from 'mongoose'

const schemaOptions = {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true },
  id: false
}

const userSchema = new Schema(
  {
    tenantId: {
      type: String
    },

    name: {
      first: {
        type: String,
        trim: true,
        maxLength: 50,
        required: true
      },

      last: {
        type: String,
        trim: true,
        maxLength: 50,
        required: true
      },

      middle: {
        type: String,
        minLength: 3,
        maxLength: 50,
        trim: true,
        default: null
      }
    },

    displayName: {
      type: String,
      trim: true,
      maxLength: 50,
      default: function () {
        return this.name.first.concat(` ${this.name.last}`)
      }
    },

    jobTitle: {
      type: String,
      minLength: 2,
      maxLength: 50,
      default: null
    },

    queryName: {
      type: String,
      default: function () {
        return this.name.first.concat(
          this.name.middle ? ` ${this.name.middle}` : '',
                    ` ${this.name.last}`,
                    ` ${this.displayName}`
        )
      }
    },

    dob: {
      type: String,
      default: null
    },

    phone: {
      type: String,
      unique: true,
      trim: true,
      required: true
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    password: {
      type: String,
      trim: true,
      maxLength: 1024,
      required: true
    },

    resetPwd: {
      type: Boolean,
      default: true
    },

    active: {
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

    role: {
      type: String,
      enum: Object.values(roles),
      required: true
    },

    segments: {
      type: [Schema.Types.ObjectId],
      default: null
    },

    lastLoginTime: {
      type: Date,
      default: null
    },

    timeZone: {
      type: String,
      default: 'Africa/Lagos'
    },

    refreshTokens: {
      type: [
        {
          token: {
            type: String
          },
          exp: {
            type: Number
          }
        }
      ],
      default: null
    }
  },
  schemaOptions
)

userSchema.virtual('fullName').get(function () {
  return this.name.first.concat(
    this.name.middle ? ` ${this.name.middle}` : '',
        ` ${this.name.last}`
  )
})

userSchema.pre('save', function (next) {
  try {
    // Hashing password
    if (this.modifiedPaths().includes('password')) { this.password = hashSync(this.password, 10) }

    next()
  } catch (exception) {
    next(exception)
  }
})

/**
 * Compare user inputted password to password on database.
 * @param {string} password
 * @returns {boolean}
 */
userSchema.methods.comparePasswords = async function (password) {
  return await compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
  return sign(
    {
      id: this._id.toString(),
      tenantId: this.tenantId,
      role: this.role,
      active: this.active,
      timeZone: this.timeZone
    },
    get('jwt.secret.access'),
    {
      audience: get('jwt.audience'),
      expiresIn: parseInt(get('jwt.expTime.access')),
      issuer: get('jwt.issuer')
    }
  )
}

userSchema.methods.generateRefreshToken = function () {
  const refreshTokenTTL = parseInt(get('jwt.expTime.refresh'))
  const refreshToken = sign(
    {
      id: this._id.toString()
    },
    get('jwt.secret.refresh'),
    {
      audience: get('jwt.audience'),
      expiresIn: refreshTokenTTL,
      issuer: get('jwt.issuer')
    }
  )

  const expires = Date.now() + refreshTokenTTL * 1000

  return {
    token: refreshToken,
    exp: expires
  }
}

const User = model('User', userSchema)

export default User
