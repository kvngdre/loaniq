import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";
import autoPopulate from "mongoose-autopopulate";

import { userStatus } from "../constants/index.js";

export const userSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

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

    phone: {
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

    passwordHash: {
      type: String,
      required: true,
    },

    requirePasswordReset: {
      type: Boolean,
      default: true,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      autopopulate: true,
    },

    status: {
      type: String,
      default: userStatus.PENDING,
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
  return this.firstName.concat(` ${this.lastName}`);
};

// eslint-disable-next-line func-names
userSchema.pre("save", function (next) {
  if (this.modifiedPaths()?.includes("password")) {
    this.password = bcrypt.hashSync(this.password, 12);
  }
  next();
});

export const User = model("User", userSchema);
