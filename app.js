import dotenv from "dotenv";
import express from "express";
import AppError from "./utils/appError.js";
import { globalErrorHandler } from "./utils/errorContoller.js";
import userRouter from "./modules/userModule/userRoutes.js";
import productRouter from "./modules/productModule/productRoutes.js";
import categoryRouter from "./modules/categoryModule/categoryRoutes.js";
import cartRouter from "./modules/cartModule/cartRoutes.js";
import cors from "cors";
import couponRouter from "./modules/couponModule/couponRoutes.js";

dotenv.config({ path: "./config.env" });

const app = express();
app.use("/uploads", express.static("uploads"));
app.use(cors());
app.use(express.json());

app.use(userRouter);
app.use(productRouter);
app.use(categoryRouter);
app.use(cartRouter);
app.use(couponRouter);

// Handling unhandled Routes
app.all("*", (req, res, next) => {
  next(
    new AppError(`failed to find this Route ${req.originalUrl} on the server`),
    404
  );
});

// creating a global handling Error midlleware-function
app.use(globalErrorHandler);

export default app;
