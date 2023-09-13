import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";
import autoPopulate from "mongoose-autopopulate";

import { config } from "../../config/index.js";
import { messages } from "../../utils/index.js";

export const userSchema = new Schema(
  {
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

    phoneNumber: {
      type: String,
      unique: true,
      default: null,
      sparse: true,
    },

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

    resetPassword: {
      type: Boolean,
      default: true,
    },

    role: {
      type: String,
      required: true,
    },

    active: {
      type: Boolean,
      default: false,
    },

    segments: {
      type: [Schema.Types.ObjectId],
      default: null,
    },

    configurations: {
      avatar: {
        type: String,
        default: null,
      },

      lastLoginTime: {
        type: Date,
        default: null,
      },
    },
  },

  { timestamps: true },
);

userSchema.plugin(autoPopulate);

userSchema.methods.fullName = function () {
  return this.firstName.concat(` ${this.lastName}`);
};

userSchema.methods.permitLogin = function () {
  const data = { message: "", redirect: { url: null } };

  if (!this.isEmailVerified && !this.active) {
    data.redirect.url = `${config.api.base_url}/auth/verify?email=${this.email}`;
    data.message = messages.AUTH.LOGIN.ACCOUNT_UNVERIFIED;
  } else if (!this.active) {
    data.redirect.url = `${config.api.base_url}/tenants/contact-admin?email=${this.email}`;
    data.message = messages.AUTH.LOGIN.ACCOUNT_DEACTIVATED;
  } else if (this.resetPassword) {
    data.redirect.url = `${config.api.base_url}/auth/reset-password?email=${this.email}`;
    data.message = messages.AUTH.LOGIN.RESET_PWD;
  } else {
    return { isPermitted: true, data };
  }

  return { isPermitted: false, data };
};

userSchema.methods.purgeSensitiveData = function () {
  delete this._doc?.password;
  delete this._doc?.resetPassword;

  return this;
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// hashing user password before insert
userSchema.pre("save", function (next) {
  if (this.modifiedPaths()?.includes("password")) {
    this.password = bcrypt.hashSync(this.password, 12);
  }
  next();
});

export const User = model("User", userSchema);
