import { Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'
import NotFoundError from '../errors/NotFoundError.js'

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
      minLength: 3,
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

userSchema.virtual('full_name').get(function () {
  return this.first_name?.concat(
    this.middle_name ? ` ${this.middle_name}` : '',
    ` ${this.last_name}`
  )
})

userSchema.methods.comparePasswords = function (password) {
  return bcrypt.compareSync(password, this.password)
}

userSchema.methods.permitLogin = function () {
  const data = { id: this._id, redirect: {} }

  if (!this.isEmailVerified && !this.active) {
    data.redirect.verifyNewUser = true
    return {
      isGranted: false,
      message: 'Your email has not been verified.',
      data
    }
  }

  if (this.resetPwd) {
    data.redirect.reset_password = true
    return {
      isGranted: false,
      message: 'Your password reset has been triggered.',
      data
    }
  }

  if (!this.active) {
    data.redirect.inactive = true
    return {
      isGranted: false,
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
    throw new NotFoundError('Users not found.')
  }

  if (!doc) throw new NotFoundError('User not found.')
})

const User = model('User', userSchema)

export default User
