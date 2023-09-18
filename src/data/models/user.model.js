import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";
import autoPopulate from "mongoose-autopopulate";

import { USER_STATUS } from "../../utils/helpers/user.helper.js";

export const userSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
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
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      autopopulate: true,
    },

    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.PENDING,
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

userSchema.methods.purgeSensitiveData = function () {
  delete this._doc?.password;
  delete this._doc?.resetPassword;

  return this;
};

// hashing user password before insert
userSchema.pre("save", function (next) {
  if (this.modifiedPaths()?.includes("password")) {
    this.password = bcrypt.hashSync(this.password, 12);
  }
  next();
});

export const User = model("User", userSchema);
