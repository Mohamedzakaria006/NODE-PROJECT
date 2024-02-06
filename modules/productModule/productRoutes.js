import express from "express";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from "./productController.js";
import { isLoggedIn } from "../userModule/userControllers.js";
import { uploadMulterImage } from "../../utils/multerProducts.js";
import { uploadImage } from "../../utils/cloudinaryProductsUpload.js";
const productRouter = express.Router();

productRouter.post(
  "/products",
  isLoggedIn,
  uploadMulterImage,
  uploadImage,
  addProduct
);
productRouter.delete("/products/:id", isLoggedIn, deleteProduct);
productRouter.patch("/products/:id", isLoggedIn, updateProduct);
productRouter.get("/products", isLoggedIn, getAllProducts);
productRouter.get("/products/:id", isLoggedIn, getProduct);

export default productRouter;
