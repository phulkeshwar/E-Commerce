import { connectDB } from "../config/db.js";
import { Cart } from "../models/Cart.model.js";
import { Coupon } from "../models/Coupon.model.js";
import { Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { Review } from "../models/Review.model.js";
import { User } from "../models/User.model.js";

await connectDB();

await Promise.all([
  Cart.deleteMany({}),
  Coupon.deleteMany({}),
  Order.deleteMany({}),
  Product.deleteMany({}),
  Review.deleteMany({}),
  User.deleteMany({}),
]);

console.log("Cleared GramBazaar database.");
process.exit(0);
