import Category from "./categorySchema.js";
import User from "../userModule/userSchema.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { promisify } from "util";
import AppError from "../../utils/appError.js";
import jwt from "jsonwebtoken";

export const addCategory = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  req.body.image = req.file.filename;
  const category = await Category.create({
    ...req.body,
    createdBy: decoded.id,
  });
  await category.save();
  res.status(200).json({
    message: "category created",
    category,
    ImageURL: req.results.url,
  });
});

export const deleteCategory = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const userAddedBy = await User.findById(decoded.id);
  const category = await Category.findById(req.params.id);

  if (!category) return next(new AppError("This category does not exist"));
  if (
    userAddedBy.role !== "admin" ||
    userAddedBy.id !== category.createdBy.toString()
  ) {
    return next(new AppError("Your Are not allowed to delete this category"));
  }

  await Category.findByIdAndDelete(req.params.id);
  res.status(200).json({
    message: "The Category Deleted Successfully",
  });
});

export const updateCategory = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const userAddedBy = await User.findById(decoded.id);
  const category = await Category.findById(req.params.id);

  if (!category) return next(new AppError("This category does not exist"));
  if (
    userAddedBy.role !== "admin"
    // userAddedBy.id !== category.createdBy.toString()
  ) {
    return next(new AppError("Your Are not allowed to update this category"));
  }

  const foundedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  await foundedCategory.save();
  res.status(200).json({
    message: "The category updated Successfully",
    foundedCategory,
  });
});

export const getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find();
  res.json({
    message: "Success",
    results: categories.length,
    categories,
  });
});

export const getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  category.image = "http://localhost:3000/uploads/categories/" + category.image;
  if (!category) return next(new AppError("This category does not exist"));
  res.status(200).json({
    message: "Success",
    category,
  });
});
