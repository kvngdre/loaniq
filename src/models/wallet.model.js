import { Schema, model } from 'mongoose';
import NotFoundError from '../errors/NotFoundError.js';

const schemaOptions = { timestamps: true, versionKey: false };

const walletSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      unique: true,
      required: [true, 'Tenant Id is required.'],
    },

    balance: {
      type: Number,
      default: 0,
      set: (v) => Math.floor(v * 100) / 100,
    },

    last_credit_date: {
      type: Date,
      default: null,
    },
  },
  schemaOptions,
);

walletSchema.post(/^find/, (doc) => {
  if (Array.isArray(doc) && doc.length === 0) {
    throw new NotFoundError('Wallets not found.');
  }

  if (!doc) throw new NotFoundError('Wallet not found.');
});

const Wallet = model('Wallet', walletSchema);

export default Wallet;
