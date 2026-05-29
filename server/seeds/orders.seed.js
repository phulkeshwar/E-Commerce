import { connectDB } from "../config/db.js";
import { Coupon } from "../models/Coupon.model.js";

await connectDB();

const coupons = [
  { code: "GRAM10", discountType: "percent", discountValue: 10, minOrderAmount: 500 },
  { code: "SAVE20", discountType: "percent", discountValue: 20, minOrderAmount: 1200 },
  { code: "FIRST50", discountType: "flat", discountValue: 50, minOrderAmount: 299 },
];

for (const coupon of coupons) {
  await Coupon.findOneAndUpdate({ code: coupon.code }, { $set: coupon }, { upsert: true, new: true });
}

console.log(`Seeded ${coupons.length} coupons.`);
process.exit(0);
