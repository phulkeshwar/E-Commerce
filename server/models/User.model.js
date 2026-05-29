import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    membership: { type: String, default: "Silver" },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    membership: this.membership,
  };
};

export const User = mongoose.model("User", userSchema);
