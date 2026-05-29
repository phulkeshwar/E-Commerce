import { ApiResponse } from "../utils/ApiResponse.js";
import { Coupon } from "../models/Coupon.model.js";

export const getCoupons = async (_req, res) => {
  const coupons = await Coupon.find({ active: true }).sort({ minOrderAmount: 1 });
  res.json(new ApiResponse(true, "Coupons fetched.", { coupons }));
};
