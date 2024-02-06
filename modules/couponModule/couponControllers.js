import AppError from "../../utils/appError.js";
import Coupon from "./couponSchema.js";
import User from "../userModule/userSchema.js";
import Product from "../productModule/productSchema.js";
import Cart from "../cartModule/cartSchema.js";
import { catchAsync } from "./../../utils/catchAsync.js";
import mongoose from "mongoose";

export const createCoupon = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (user.role !== "admin")
    return next(new AppError("You are not allowed to create a coupon"));
  if (await Coupon.findOne({ couponCode: req.body.couponCode }))
    return next(new AppError("This Coupon is already exist"));
  const coupon = await Coupon.create(req.body);

  const objectId = new mongoose.Types.ObjectId(req.user.id);
  coupon.createdBy = objectId;
  await coupon.save();
  res.status(201).json({
    status: "success",
    message: "the coupon is created Successfully",
  });
});

export const deleteCoupon = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (user.role !== "admin")
    return next(new AppError("You are not allowed to delete a coupon"));
  const searchedCoupon = await Coupon.findById(req.params.id);
  if (!searchedCoupon) return next(new AppError("This coupon is not exist"));

  const coupon = await Coupon.findByIdAndUpdate(req.params.id, {
    isValid: false,
  });
  const objectId = new mongoose.Types.ObjectId(req.user.id);
  coupon.deletedBy = objectId;
  await coupon.save();
  res.status(200).json({
    status: "success",
    message: "The coupon is deleted Successfully",
  });
});

export const updateCoupon = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (user.role !== "admin")
    return next(new AppError("You are not allowed to update a coupon"));
  const searchedCoupon = await Coupon.findById(req.params.id);
  if (!searchedCoupon) return next(new AppError("This coupon is not exist"));
  if (!searchedCoupon.isValid)
    return next(new AppError("This Coupon is not valid anymore"));
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body);
  const objectId = new mongoose.Types.ObjectId(req.user.id);
  coupon.updatedBy = objectId;
  await coupon.save();
  res.status(200).json({
    status: "success",
    message: "The coupon is updated Successfully",
  });
});

export const getAllCoupons = catchAsync(async (req, res, next) => {
  const coupons = await Coupon.find();
  if (!coupons) return next(new AppError("There are no coupons"), 400);
  res.status(200).json({
    status: "success",
    results: coupons.length,
    coupons,
  });
});

// apply a sale Coupon on a product globally
export const applySaleCoupon = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  const coupon = await Coupon.findOne({ couponCode: req.body.couponCode });
  const currentUser = await User.findById(req.user.id);

  if (currentUser.role !== "admin")
    return next(new AppError("You are not allowd to apply a coupon"));
  if (!coupon.isValid || coupon.expiresIn < Date.now())
    return next(new AppError("This Coupon is not Valid"));
  if (product.price > product.finalPrice)
    return next(new AppError("This Product already has a coupon"));

  const priceAfterDisccount =
    product.price - (product.price * coupon.value) / 100;

  product.finalPrice = priceAfterDisccount;

  await product.save();
  res.status(200).json({
    status: "success",
    message: "coupon is applied successfully",
    product,
  });
});

// apply a coupon on a product in a specic car
export const applyCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findOne({ couponCode: req.body.couponCode });
  const currentUser = await User.findById(req.user.id);
  const currentCart = await Cart.findById(currentUser.cart);
  const product = currentCart.products.find(
    (product) => product._id.toString() === req.params.productId
  );
  if (!coupon.isValid || coupon.expiresIn < Date.now())
    return next(new AppError("This Coupon is not Valid"));
  if (product.price > product.finalPrice)
    return next(new AppError("This Product already has a coupon"));

  const priceAfterDisccount =
    product.price - (product.price * coupon.value) / 100;

  product.finalPrice = priceAfterDisccount;

  await Cart.updateOne(
    { _id: currentUser.cart },
    {
      $inc: {
        finalPrice: -(product.price * coupon.value) / 100,
      },
    }
  );

  await product.save();
  await currentCart.save();

  res.status(200).json({
    status: "success",
    message: "coupon is applied successfully",
    product,
  });
});

// apply coupon on the compelete Cart if none of the products has an applied Coupon
export const applyCartCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findOne({ couponCode: req.body.couponCode });
  const currentUser = await User.findById(req.user.id);
  const currentCart = await Cart.findById(currentUser.cart);
  if (currentCart.totalPrice > currentCart.finalPrice) {
    return next(
      new AppError("There is a product in this cart already has a coupon"),
      400
    );
  }
  if (currentCart.finalPrice === 0) {
    return next(new AppError("There are no products in this cart"), 400);
  }
  if (!coupon.isValid || coupon.expiresIn < Date.now())
    return next(new AppError("This Coupon is not Valid"));
  const priceAfterDisccount =
    currentCart.totalPrice - (currentCart.totalPrice * coupon.value) / 100;
  currentCart.finalPrice = priceAfterDisccount;
  await currentCart.save();

  res.status(200).json({
    status: "success",
    message: "The Coupon is applied successfully",
  });
});
