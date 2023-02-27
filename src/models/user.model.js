import { constants } from '../config'
import { hashSync, compare } from 'bcryptjs'
import { getUserRoleKeys, userRoles } from '../utils/userRoles'
import { Schema, model } from 'mongoose'
import jwt from 'jsonwebtoken'
import NotFoundError from '../errors/NotFoundError'

const schemaOptions = {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true },
  id: false
}

const userSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      // unique: true,
      required: true
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

    display_name: {
      type: String,
      trim: true,
      maxLength: 50,
      default: function () {
        return this.name.first.concat(` ${this.name.last}`)
      }
    },

    job_title: {
      type: String,
      minLength: 2,
      maxLength: 50,
      default: null
    },

    dob: {
      type: String,
      default: null
    },

    phone_number: {
      type: String,
      unique: true,
      trim: true,
      required: true
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      // unique: true,
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

    role: {
      type: String,
      enum: Object.keys(userRoles),
      default: getUserRoleKeys(userRoles.OWNER)[0],
      required: true
    },

    segments: {
      type: [Schema.Types.ObjectId],
      ref: 'Segment'
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

      expires: {
        type: Number,
        default: null
      }
    },

    refreshTokens: {
      type: [
        {
          token: {
            type: String
          },
          expires: {
            type: Number
          }
        }
      ],
      default: null
    }
  },
  schemaOptions
)

userSchema.virtual('full_Name').get(function () {
  return this.name.first.concat(
    this.name.middle ? ` ${this.name.middle}` : '',
    ` ${this.name.last}`
  )
})

userSchema.methods.comparePasswords = async function (password) {
  return await compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id.toString(),
      tenantId: this.tenantId,
      role: userRoles[this.role]
    },
    constants.jwt.secret.access,
    {
      audience: constants.jwt.audience,
      expiresIn: constants.jwt.exp_time.access,
      issuer: constants.jwt.issuer
    }
  )
}

userSchema.methods.generateRefreshToken = function () {
  const refreshToken = jwt.sign(
    {
      id: this._id.toString()
    },
    constants.jwt.secret.refresh,
    {
      audience: constants.jwt.audience,
      expiresIn: constants.jwt.exp_time.refresh,
      issuer: constants.jwt.issuer
    }
  )

  return {
    token: refreshToken,
    expires: Date.now() + constants.jwt.exp_time.refresh * 1000
  }
}

// Hashing password before insert
userSchema.pre('save', function (next) {
  if (this.modifiedPaths()?.includes('password')) {
    this.password = hashSync(this.password, 10)
  }

  next()
})

userSchema.post(/^find/, function (doc) {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('User accounts not found.')
  }

  if (!doc) throw new NotFoundError('User account not found.')
})

const User = model('User', userSchema)

export default User
