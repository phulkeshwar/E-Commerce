import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open", "resolved"], default: "open" },
    adminReply: { type: String, default: "" },
  },
  { timestamps: true }
);

supportTicketSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    userId: this.userId ? this.userId.toString() : null,
    name: this.name,
    email: this.email,
    subject: this.subject,
    message: this.message,
    status: this.status,
    adminReply: this.adminReply || "",
    createdAt: this.createdAt,
  };
};

export const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
