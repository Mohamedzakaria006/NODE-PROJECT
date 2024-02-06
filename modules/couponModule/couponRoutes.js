import express from "express";
import {
  applyCoupon,
  applySaleCoupon,
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  updateCoupon,
  applyCartCoupon,
} from "./couponControllers.js";
import { isLoggedIn } from "../userModule/userControllers.js";
const couponRouter = express.Router();

couponRouter.post("/coupon", isLoggedIn, createCoupon);
couponRouter.delete("/coupon/:id", isLoggedIn, deleteCoupon);
couponRouter.patch("/coupon/:id", isLoggedIn, updateCoupon);
couponRouter.get("/coupon", isLoggedIn, getAllCoupons);
couponRouter.post("/sale/:id", isLoggedIn, applySaleCoupon);
couponRouter.post("/coupon/apply/:productId", isLoggedIn, applyCoupon);
couponRouter.post("/cartCoupon", isLoggedIn, applyCartCoupon);

export default couponRouter;
