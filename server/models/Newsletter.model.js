import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    active: { type: Boolean, default: true, index: true },
    unsubscribedAt: { type: Date, default: null },
    source: { type: String, default: "footer" },
  },
  { timestamps: true }
);

export const Newsletter = mongoose.model("Newsletter", newsletterSchema);
