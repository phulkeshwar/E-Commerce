import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ override: true });

export const connectDB = async () => {

  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/GaramBazaar";

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: Number(process.env.MONGODB_TIMEOUT_MS || 10000),
  });

  if (process.env.NODE_ENV !== "test") {
    console.log("MongoDB connected.");
  }
};
