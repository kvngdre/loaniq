import { Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'
import NotFoundError from '../errors/NotFoundError.js'
import autoPopulate from 'mongoose-autopopulate'

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
      required: true
    },

    avatar: {
      type: String,
      default: null
    },

    first_name: {
      type: String,
      trim: true,
      maxLength: 50,
      required: true
    },

    last_name: {
      type: String,
      trim: true,
      maxLength: 50,
      required: true
    },

    middle_name: {
      type: String,
      maxLength: 50,
      trim: true,
      default: null
    },

    display_name: {
      type: String,
      trim: true,
      maxLength: 50,
      default: function () {
        return this.first_name.concat(` ${this.last_name}`)
      }
    },

    job_title: {
      type: String,
      minLength: 2,
      maxLength: 50,
      default: null
    },

    dob: {
      type: Date,
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

    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      autopopulate: true,
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

    segments: {
      type: [Schema.Types.ObjectId],
      default: null
    },

    otp: {
      pin: {
        type: String,
        default: null
      },

      expiresIn: {
        type: Number,
        default: null
      }
    },

    last_login_time: {
      type: Date,
      default: null
    }
  },
  schemaOptions
)

userSchema.plugin(autoPopulate)

userSchema.virtual('full_name').get(function () {
  return this.first_name?.concat(
    this.middle_name ? ` ${this.middle_name}` : '',
    ` ${this.last_name}`
  )
})

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

/**
 * Validates the OTP sent to user email.
 * @param {string} otp
 * @returns {{ isValid: boolean, reason: (string|undefined) }}
 */
userSchema.methods.validateOTP = function (otp) {
  if (Date.now() > this.otp.expiresIn) {
    return { isValid: false, reason: 'OTP expired' }
  }

  if (otp !== this.otp.pin) {
    return { isValid: false, reason: 'Invalid OTP' }
  }

  return { isValid: true }
}

// Checking if user can be permitted to login
userSchema.methods.permitLogin = function () {
  const data = { id: this._id, redirect: {} }

  if (!this.isEmailVerified && !this.active) {
    data.redirect.verifyNewUser = true
    return {
      isPermitted: false,
      message: 'Your account has not been verified.',
      data
    }
  }

  if (this.resetPwd) {
    data.redirect.reset_password = true
    return {
      isPermitted: false,
      message: 'Your password reset has been triggered.',
      data
    }
  }

  if (!this.active) {
    data.redirect.inactive = true
    return {
      isPermitted: false,
      message: 'Account deactivated. Contact your administrator.',
      data
    }
  }

  return { isGranted: true }
}

userSchema.methods.purgeSensitiveData = function () {
  delete this._doc?.password
  delete this._doc?.otp
  delete this._doc?.resetPwd
}

// Hashing password before insert
userSchema.pre('save', function (next) {
  if (this.modifiedPaths()?.includes('password')) {
    this.password = bcrypt.hashSync(this.password, 10)
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
