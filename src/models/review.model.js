import { Schema, model } from "mongoose";
import autoPopulate from "mongoose-autopopulate";
import { reviewStatus } from "../utils/common.js";
import NotFoundError from "../errors/NotFoundError.js";

const schemaOptions = { timestamps: true, versionKey: false };

const reviewSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(reviewStatus),
      default: reviewStatus.PENDING,
    },

    remark: {
      type: String,
      trim: true,
      default: null,
    },

    type: {
      type: String,
      enum: ["Customer", "Loan"],
      required: true,
    },

    comment: {
      type: String,
      trim: true,
      default: null,
    },

    document: {
      type: Schema.Types.ObjectId,
      ref: (self = this) => self.type,
      required: true,
    },

    alteration: {
      type: Schema.Types.Mixed,
      required: true,
    },

    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      autopopulate: { select: "display_name job_title" },
      required: true,
    },

    modified_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      autopopulate: { select: "display_name job_title" },
    },
  },
  schemaOptions,
);

reviewSchema.plugin(autoPopulate);

reviewSchema.post(/^find/, async (docs) => {
  if (Array.isArray(docs)) {
    if (docs.length === 0) throw new NotFoundError("Reviews not found.");

    for (const doc of docs) {
      await doc.populate({
        path: "document",
        select: (() => Object.keys(doc.alteration))(),
      });
    }
  } else {
    if (!docs) throw new NotFoundError("Review not found.");

    await docs.populate([
      { path: "document", select: (() => Object.keys(docs.alteration))() },
    ]);
  }
});

const Review = model("Review", reviewSchema);

export default Review;
