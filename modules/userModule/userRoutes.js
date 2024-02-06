import express from "express";
import {
  deactivateAccount,
  deactivate,
  forgotPassword,
  isLoggedIn,
  login,
  resetPassword,
  signup,
  updateUser,
  verifyAccount,
  activate,
  activateAccount,
} from "./userControllers.js";
import { validationFn } from "../../validation/validationFn.js";
import { userValidationSchema } from "../../validation/validationSchema.js";

const userRouter = express.Router();

userRouter.post("/signup", validationFn(userValidationSchema), signup);
userRouter.get("/verify/:token", verifyAccount);
userRouter.post("/login", login);
userRouter.post("/forgotPassword", forgotPassword);
userRouter.post("/resetPassword/:token", resetPassword);
userRouter.patch("/users/:id", isLoggedIn, updateUser);
userRouter.post("/deactivate/", deactivateAccount);
userRouter.get("/deactivate/:token", deactivate);
userRouter.post("/activate/", activateAccount);
userRouter.get("/activate/:token", activate);

export default userRouter;
