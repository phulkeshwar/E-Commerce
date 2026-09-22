import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ override: true });

export const connectDB = async () => {
  let uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/GaramBazaar";

  // Safeguard: callus.wdcsjbc.mongodb.net is dead and causes 30s DNS timeout
  if (uri.includes("callus.wdcsjbc.mongodb.net")) {
    uri = "mongodb+srv://pkmahto009_db_user:a7HqMp0qHc8HA81e@callus.wdcsjbc.mongodb.net/";
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  if (process.env.NODE_ENV !== "test") {
    console.log("MongoDB connected.");
  }
};
