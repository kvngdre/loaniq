import bcrypt from "bcryptjs";
import autoPopulate from "mongoose-autopopulate";

import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    avatar: {
      type: String,
      default: null,
    },

    firstName: {
      type: String,
      trim: true,
      required: true,
    },

    lastName: {
      type: String,
      trim: true,
      required: true,
    },

    middleName: {
      type: String,
      trim: true,
      default: null,
    },

    displayName: {
      type: String,
      trim: true,
      maxLength: 50,
      default() {
        return this.firstName.concat(` ${this.lastName}`);
      },
    },

    jobTitle: {
      type: String,
      minLength: 2,
      maxLength: 50,
      default: null,
    },

    dob: {
      type: Date,
      default: null,
    },

    phoneNo: String,

    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
      required: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    resetPwd: {
      type: Boolean,
      default: true,
    },

    active: {
      type: Boolean,
      default: false,
    },

    segments: {
      type: [Schema.Types.ObjectId],
      default: null,
    },

    lastLoginTime: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.plugin(autoPopulate);

userSchema.methods.fullName = function () {
  const { firstName, middleName, lastName } = this;
  const fullNameParts = [firstName];

  if (middleName) {
    fullNameParts.push(middleName);
  }

  fullNameParts.push(lastName);

  return fullNameParts.join(" ");
};

// Checking if user can be permitted to login
userSchema.methods.permitLogin = function () {
  const data = { id: this._id, redirect: {} };

  if (!this.isEmailVerified && !this.active) {
    data.redirect.verifyNewUser = true;
    return {
      isPermitted: false,
      message: "Your account has not been verified.",
      data,
    };
  }

  if (this.resetPwd) {
    data.redirect.reset_password = true;
    return {
      isPermitted: false,
      message: "Your password reset has been triggered.",
      data,
    };
  }

  if (!this.active) {
    data.redirect.inactive = true;
    return {
      isPermitted: false,
      message: "Account deactivated. Contact your administrator.",
      data,
    };
  }

  return { isGranted: true };
};

userSchema.methods.purgeSensitiveData = function () {
  delete this._doc?.password;
  delete this._doc?.resetPwd;
};

userSchema.methods.validateOTP = function (otp) {
  if (Date.now() > this.otp.expiresIn) {
    return { isValid: false, reason: "OTP expired" };
  }

  if (otp !== this.otp.pin) {
    return { isValid: false, reason: "Invalid OTP" };
  }

  return { isValid: true };
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// ! Hashing user password before insert
userSchema.pre("save", function (next) {
  if (this.modifiedPaths()?.includes("password")) {
    this.password = bcrypt.hashSync(this.password, 12);
  }

  next();
});

export const User = model("User", userSchema);
