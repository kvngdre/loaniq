import bcrypt from 'bcryptjs';
import { Schema, model } from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';

const userSchema = new Schema(
  {
    avatar: {
      type: String,
      default: null,
    },

    first_name: {
      type: String,
      trim: true,
      minLength: 2,
      maxLength: 50,
      required: true,
    },

    last_name: {
      type: String,
      trim: true,
      minLength: 2,
      maxLength: 50,
      required: true,
    },

    middle_name: {
      type: String,
      minLength: 1,
      maxLength: 50,
      trim: true,
      default: null,
    },

    display_name: {
      type: String,
      trim: true,
      maxLength: 50,
      default: function () {
        return this.first_name.concat(` ${this.last_name}`);
      },
    },

    job_title: {
      type: String,
      minLength: 2,
      maxLength: 50,
      default: null,
    },

    dob: {
      type: Date,
      default: null,
    },

    phone_number: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Role',
      autopopulate: true,
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    segments: {
      type: [Schema.Types.ObjectId],
      default: null,
    },

    configurations: {
      type: {
        password: {
          type: String,
          trim: true,
          maxLength: 1024,
          required: true,
        },

        otp: {
          pin: {
            type: String,
            default: null,
          },

          expiresIn: {
            type: Number,
            default: null,
          },
        },

        isToResetPassword: {
          type: Boolean,
          default: true,
        },

        nextPasswordReset: {
          type: Number,
          default: null,
        },

        sessions: {
          type: [
            {
              os: String,
              client: String,
              ip: String,
              login_time: Date,
              token: String,
              expiresIn: Number,
            },
          ],
        },
      },
    },
  },
  { timestamps: true, versionKey: false },
);

userSchema.plugin(autoPopulate);

if (!userSchema.options.toObject) userSchema.options.toObject = {};
userSchema.options.toObject.transform = function (doc, ret, options) {
  delete ret.configurations;
  return ret;
};

// Checking if user can be permitted to login
userSchema.methods.permitLogin = function () {
  const data = { id: this._id, redirect: {} };

  if (!this.isEmailVerified && !this.active) {
    data.redirect.verifyNewUser = true;
    return {
      isPermitted: false,
      message: 'Your account has not been verified.',
      data,
    };
  }

  if (this.resetPwd) {
    data.redirect.reset_password = true;
    return {
      isPermitted: false,
      message: 'Your password reset has been triggered.',
      data,
    };
  }

  if (!this.active) {
    data.redirect.inactive = true;
    return {
      isPermitted: false,
      message: 'Account deactivated. Contact your administrator.',
      data,
    };
  }

  return { isGranted: true };
};

userSchema.methods.purgeSensitiveData = function () {
  delete this._doc?.otp;
  delete this._doc?.password;
  delete this._doc?.resetPwd;
  delete this._doc?.salt;
};

userSchema.methods.validateOTP = function (otp) {
  if (Date.now() > this.otp.expiresIn) {
    return { isValid: false, reason: 'OTP expired' };
  }

  if (otp !== this.otp.pin) {
    return { isValid: false, reason: 'Invalid OTP' };
  }

  return { isValid: true };
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.configurations.password);
};

// // ! Hashing user password before insert
// userSchema.pre('save', function (next) {
//   console.log(this.modifiedPaths());
//   if (this.modifiedPaths()?.includes('configurations.password')) {
//     this.configurations.password = bcrypt.hashSync(
//       this.configurations.password,
//       12,
//     );
//   }

//   next();
// });

const User = model('User', userSchema);

export default User;
