import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import {
  maritalStatus,
  relationships,
  status,
  validIds,
} from "../utils/common.js";
import computeAge from "../utils/computeAge.js";
import computeTenure from "../utils/computeTenure.js";
import NotFoundError from "../errors/NotFoundError.js";

const schemaOptions = {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true },
};

const clientSchema = new Schema(
  {
    passport: {
      type: String,
      // required: true,
      default: null,
    },

    id_card: {
      type: String,
      // required: true,
      default: null,
    },

    first_name: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 50,
    },

    last_name: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 50,
    },

    middle_name: {
      type: String,
      minLength: 1,
      maxLength: 50,
      default: null,
    },

    status: {
      type: String,
      enum: Object.values(status),
      default: status.ONBOARDING,
    },

    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      default: "643d935b91a080bc035b5bf8",
      autopopulate: true,
    },

    gender: {
      type: String,
      // required: true,
      enum: ["male", "female"],
    },

    birth_date: {
      type: Date,
      // required: true,
      default: null,
    },

    address: {
      type: String,
      // required: true,
      default: null,
      maxLength: 255,
    },

    state: {
      type: Schema.Types.ObjectId,
      // required: true,
      default: null,
      ref: "State",
    },

    phone_number: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    email: {
      type: String,
      default: null,
    },

    marital_status: {
      type: String,
      // required: true,
      enum: maritalStatus,
    },

    bvn: {
      type: String,
      // required: true,
      default: null,
      unique: true,
      sparse: true,
    },

    isValidBVN: {
      type: Boolean,
      default: false,
    },

    staff_id: {
      type: String,
      required: true,
      unique: true,
    },

    passcode: {
      type: String,
      required: true,
    },

    resetPasscode: {
      type: Boolean,
      default: false,
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

    id_type: {
      type: String,
      // required: true,
      enum: validIds,
    },

    id_number: {
      type: String,
      // required: true,
      minLength: 3,
      maxLength: 50,
    },

    segment: {
      type: Schema.Types.ObjectId,
      default: null,
      // required: true,
      ref: "Segment",
    },

    command: {
      type: String,
      // required: true,
      default: null,
    },

    employer_address: {
      type: String,
      // required: true,
      default: null,
      maxLength: 255,
    },

    employer_state: {
      type: Schema.Types.ObjectId,
      // required: true,
      default: null,
      ref: "State",
    },

    hire_date: {
      type: Date,
      // required: true,
      default: null,
    },

    income: {
      type: Map,
      of: Schema.Types.Mixed,
      default: null,
    },

    nok_full_name: {
      type: String,
      // required: true,
      default: null,
    },

    nok_address: {
      type: String,
      // required: true,
      default: null,
      maxLength: 255,
    },

    nok_state: {
      type: Schema.Types.ObjectId,
      default: null,
      // required: true,
      ref: "State",
    },

    nok_phone_number: {
      type: String,
      // required: true,
      default: null,
    },

    nok_relationship: {
      type: String,
      // required: true,
      enum: relationships,
    },

    account_name: {
      type: String,
      // required: true,
      default: null,
    },

    account_number: {
      type: String,
      // required: true,
      default: null,
      unique: true,
      sparse: true,
    },

    bank: {
      type: Schema.Types.ObjectId,
      default: null,
      // required: true,
      ref: "Bank",
    },

    isValidAccInfo: {
      type: Boolean,
      default: false,
    },

    last_login_time: {
      type: Date,
      default: null,
    },

    session: {
      type: {
        os: String,
        location: String,
        client: String,
        ip: String,
        login_time: Date,
        token: String,
        expiresIn: Number,
      },
      default: null,
    },
  },
  schemaOptions,
);

clientSchema.virtual("full_name").get(function () {
  return this.first_name.concat(
    this.middle_name ? ` ${this.middle_name}` : "",
    ` ${this.last_name}`,
  );
});

clientSchema.virtual("age").get(function () {
  return computeAge(this.birth_date);
});

clientSchema.virtual("tenure").get(function () {
  return computeTenure(this.hire_date);
});

clientSchema.methods.getMonthNetPay = function (year, month) {
  return this.income[year][month];
};

// Checking if client can be permitted to login
clientSchema.methods.permitLogin = function () {
  const data = { id: this._id, redirect: {} };

  if (!this.isPhoneVerified && !this.status !== status.ACTIVE) {
    data.redirect.verifyNewUser = true;
    return {
      isPermitted: false,
      message: "Your account has not been verified.",
      data,
    };
  }

  if (this.resetPasscode) {
    data.redirect.reset_password = true;
    return {
      isPermitted: false,
      message: "Your passcode reset has been triggered.",
      data,
    };
  }

  if (
    !this.status === status.SUSPENDED ||
    !this.status === status.DEACTIVATED
  ) {
    data.redirect.inactive = true;
    return {
      isPermitted: false,
      message: "Account deactivated. Contact support.",
      data,
    };
  }

  return { isPermitted: true };
};

clientSchema.methods.purgeSensitiveData = function () {
  delete this._doc?.otp;
  delete this._doc?.passcode;
  delete this._doc?.resetPwd;
  delete this._doc?.salt;
};

clientSchema.methods.validateOTP = function (otp) {
  if (Date.now() > this.otp.expiresIn) {
    return { isValid: false, reason: "OTP expired" };
  }

  if (otp !== this.otp.pin) {
    return { isValid: false, reason: "Invalid OTP" };
  }

  return { isValid: true };
};

clientSchema.methods.validatePasscode = function (passcode) {
  return bcrypt.compareSync(passcode, this.passcode);
};

// ! Hashing client passcode before insert
clientSchema.pre("save", function (next) {
  if (this.modifiedPaths()?.includes("passcode")) {
    this.passcode = bcrypt.hashSync(this.passcode, 12);
  }

  next();
});

clientSchema.post(/^find/, (doc) => {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError("No client accounts found");
  }

  if (!doc) throw new NotFoundError("Client account not found");
});

const Origin = model("Client", clientSchema);

export default Origin;
