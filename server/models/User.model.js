import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false },
    googleId: { type: String, unique: true, sparse: true },
    avatarUrl: { type: String },
    role: { type: String, enum: ["user", "admin", "seller"], default: "user" },
    membership: { type: String, default: "Silver" },
    certificationStatus: { type: String, enum: ["new", "certified"], default: "new" },
    creditScore: { type: Number, default: 750 },
    phone: { type: String, trim: true, default: "" },
    address: {
      line1: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    isBanned: { type: Boolean, default: false },
    isGuest: { type: Boolean, default: false },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    isActive: { type: Boolean, default: true },
    loyaltyPoints: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    savedAddresses: [
      {
        label: { type: String, default: "Home" },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        line1: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
      }
    ],
  },
  { timestamps: true },
);

userSchema.pre("save", function () {
  if (this.role === "admin") {
    this.isVerified = true;
  }
});

userSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    membership: this.membership,
    avatarUrl: this.avatarUrl,
    certificationStatus: this.certificationStatus || "new",
    creditScore: this.creditScore ?? 750,
    phone: this.phone || "",
    address: this.address || { line1: "", city: "", state: "", pincode: "" },
    isVerified: this.role === "admin" ? true : Boolean(this.isVerified),
    isGuest: this.isGuest,
    isActive: this.isActive,
    loyaltyPoints: this.loyaltyPoints || 0,
    referralCode: this.referralCode || "",
    savedAddresses: this.savedAddresses || [],
  };
};

export const User = mongoose.model("User", userSchema);
