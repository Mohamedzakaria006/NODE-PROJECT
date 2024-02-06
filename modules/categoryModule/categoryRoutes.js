import express from "express";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  updateCategory,
} from "./categoryController.js";
import { isLoggedIn } from "../userModule/userControllers.js";
import { uploadMulterImage } from "../../utils/multerProducts.js";
import { uploadImage } from "../../utils/cloudinaryCategoryUpload.js";
const categoryRouter = express.Router();

categoryRouter.post(
  "/categories",
  isLoggedIn,
  uploadMulterImage,
  uploadImage,
  addCategory
);
categoryRouter.delete("/categories/:id", isLoggedIn, deleteCategory);
categoryRouter.patch("/categories/:id", isLoggedIn, updateCategory);
categoryRouter.get("/categories", isLoggedIn, getAllCategories);
categoryRouter.get("/categories/:id", isLoggedIn, getCategory);

export default categoryRouter;
