import mongoose from "mongoose";

const knowledgeItemSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true, index: true },
    answer: { type: String, required: true, trim: true },
    category: { type: String, default: "general", index: true },
    tags: [{ type: String, trim: true }],
    source: {
      type: String,
      enum: ["admin_faq", "seller_qa", "customer_interaction", "system_learned"],
      default: "system_learned"
    },
    vector: {
      type: [Number],
      default: []
    },
    useCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const KnowledgeItem = mongoose.model("KnowledgeItem", knowledgeItemSchema);
