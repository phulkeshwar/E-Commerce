import mongoose from "mongoose";

const chatMessageSubSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["user", "bot"], required: true },
    text: { type: String, required: true },
    action: { type: Object, default: null },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    sessionId: { type: String, required: true, index: true },
    messages: [chatMessageSubSchema],
    lastActiveAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

// Keep only the most recent 50 messages per session to preserve space
chatSessionSchema.methods.addMessage = function (sender, text, action = null) {
  this.messages.push({ sender, text, action, createdAt: new Date() });
  if (this.messages.length > 50) {
    this.messages = this.messages.slice(-50);
  }
  this.lastActiveAt = new Date();
};

export const ChatSession = mongoose.model("ChatSession", chatSessionSchema);
