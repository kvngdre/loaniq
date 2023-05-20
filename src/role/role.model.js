import { Schema, model } from 'mongoose';

const roleSchema = new Schema(
  {
    isDefault: {
      type: Boolean,
      default: false,
    },

    name: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },

    description: { type: String, lowercase: true },

    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
  },
  { timestamps: true, versionKey: false },
);

// roleSchema.index({ name: 1, tenantId: 1 }, { unique: true });

const Role = model('Role', roleSchema);

export default Role;
