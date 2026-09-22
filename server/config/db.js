import mongoose from "mongoose";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "test") {
  dotenv.config({ override: true });
} else {
  dotenv.config();
}

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/GaramBazaar";

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  if (process.env.NODE_ENV !== "test") {
    console.log("MongoDB connected.");
  }
};
