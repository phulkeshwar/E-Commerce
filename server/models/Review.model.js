import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "Customer review" },
    body: { type: String, required: true },
    media: { type: [String], default: [] },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true },
);

reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

reviewSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    productId: this.productId.toString(),
    userId: this.userId.toString(),
    name: this.name,
    rating: this.rating,
    title: this.title,
    body: this.body,
    media: this.media,
    isApproved: this.isApproved,
    createdAt: this.createdAt,
  };
};

export const Review = mongoose.model("Review", reviewSchema);
