import { Router } from "express";
import { getBrands } from "../controllers/brand.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cacheResponse } from "../utils/cache.js";

const router = Router();

router.get("/", cacheResponse(120, "catalog:brands"), asyncHandler(getBrands));

export default router;
