import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ override: true });

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await mongoose.connection.db.collection("products").deleteMany({
    affiliateLink: { $regex: "yourtag-21" },
  });
  console.log(`Deleted ${result.deletedCount} old placeholder products.`);
  const currentGadgets = await mongoose.connection.db
    .collection("products")
    .find({ category: "Gadgets" })
    .toArray();
  console.log(`Remaining active gadgets: ${currentGadgets.length}`);
  currentGadgets.forEach((g) => console.log(`- ${g.name} (${g.affiliateLink})`));
  await mongoose.disconnect();
}

cleanup();
