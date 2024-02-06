import User from "../userModule/userSchema.js";
import Product from "./productSchema.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import { catchAsync } from "../../utils/catchAsync.js";
import AppError from "../../utils/appError.js";

export const addProduct = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  req.body.image = req.file.filename;
  const product = await Product.create({
    ...req.body,
    createdBy: decoded.id,
    finalPrice: req.body.price,
  });
  return res.status(200).json({
    message: "product created",
    product,
    imageURL: req.results.url,
  });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const userAddedBy = await User.findById(decoded.id);
  const product = await Product.findById(req.params.id);
  console.log(product);
  console.log(userAddedBy.id, product.createdBy.toString());
  if (!product) return next(new AppError("This Product does not exist"));
  if (
    userAddedBy.role !== "admin" ||
    userAddedBy.id !== product.createdBy.toString()
  ) {
    return next(new AppError("Your Are not allowed to Delete this Product"));
  }

  await Product.findByIdAndDelete(req.params.id);
  res.status(200).json({
    message: "The product Deleted Successfully",
  });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const userAddedBy = await User.findById(decoded.id);
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError("This Product does not exist"));
  if (
    userAddedBy.role !== "admin"
    // userAddedBy.id !== product.createdBy.toString()
  ) {
    return next(new AppError("Your Are not allowed to update this Product"));
  }

  const foundedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  await foundedProduct.save();
  res.status(200).json({
    message: "The product updated Successfully",
    foundedProduct,
  });
});

export const getAllProducts = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  const specialQueryFileds = ["sort", "limit", "page", "fileds"];
  specialQueryFileds.forEach((el) => delete queryObj[el]);
  let query = Product.find(queryObj);

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 3;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const productsNum = await Product.countDocuments();
    if (skip >= productsNum)
      return next(new AppError("This Page does not exist"));
  }

  const products = await query;
  res.json({
    message: "Success",
    results: products.length,
    products,
  });
});

export const getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  product.image = "http://localhost:3000/uploads/" + product.image;
  if (!product) return next(new AppError("This product does not exist"));
  res.status(200).json({
    message: "Success",
    product,
  });
});
