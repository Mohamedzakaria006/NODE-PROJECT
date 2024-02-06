import express from "express";
import {
  addProductToCart,
  createCart,
  deleteProductFromCart,
  getAllCartProducts,
} from "./cartControllers.js";
import { isLoggedIn } from "../userModule/userControllers.js";
const cartRouter = express.Router();

cartRouter.post("/cart", isLoggedIn, createCart);
cartRouter.post("/cart/add/:id", isLoggedIn, addProductToCart);
cartRouter.post("/cart/delete/:id", isLoggedIn, deleteProductFromCart);
cartRouter.get("/cart/products", isLoggedIn, getAllCartProducts);

export default cartRouter;
