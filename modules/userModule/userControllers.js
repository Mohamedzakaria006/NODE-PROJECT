import crypto from "crypto";
import User from "./userSchema.js";
import { catchAsync } from "../../utils/catchAsync.js";
import AppError from "../../utils/appError.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import sendVerifyEmail from "../../utils/sendVerifyEmail.js";
import sendResetPassword from "../../utils/sendResetPasswordEmail.js";
import sendDeactivateEmail from "../../utils/sendDeactivateEmail.js";
import sendActivateEmail from "../../utils/sendActivateEmail.js";

export const signup = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (req.body.password !== req.body.passwordRepeat)
    return next(new AppError("The passwords did not match"), 400);

  if (user) return next(new AppError("Email is already signed up", 400));
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordRepeat: req.body.passwordRepeat,
    phone: req.body.phone,
    address: req.body.address,
    cart: null,
  });
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
  const url = `http://localhost:3000/verify/${token}`;
  sendVerifyEmail(newUser.email, url);

  res.status(201).json({
    message: "success",
    token,
  });
});

export const verifyAccount = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findByIdAndUpdate(decoded.id, { isVerified: true });
  if (!user)
    return next(
      new AppError("The user does not exist or the TOKEN is not valid")
    );

  res.json({
    message: "Your Account is now verified",
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new Error("Please provide The email and the Password"));

  const user = await User.findOne({ email: req.body.email });
  const correct = await user?.isCorrect(req.body.password, user.password);

  if (!user || !correct) {
    return next(
      new AppError("The Email or the Password might me inncorrect"),
      400
    );
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  const url = `http://localhost:3000/verify/${token}`;
  if (!user.isVerified) {
    sendVerifyEmail(user.email, url);
    return next(
      new AppError(
        "You should verify your Account first , a verification token is sent to your email"
      )
    );
  }
  if (!user.isActive) {
    sendActivateEmail(user.email, url);
    return next(
      new AppError(
        "You have deactivated Your Email, an Activation token is sent to your email"
      )
    );
  }
  res.json({
    message: "You have successfully logged in",
    token,
  });
});

export const isLoggedIn = catchAsync(async (req, res, next) => {
  // 1 first check that is there a token
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("please loggin first", 400));
  }
  // // we should check if it is the same person and that the person still exist
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  req.user = currentUser;
  next();
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(
      new AppError(
        "This email does not exist , please enter a valid email",
        400
      )
    );
  // create the token
  const resetToken = user.createResetPasswordToken();
  // send email contains the token
  sendResetPassword(user.email, resetToken);
  await user.save();
  res.json({
    message: "A reset Token sent to Your Email , please check it out",
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  // we have saved the encrypted token on the DB and sent the normal one to the user
  // now the user will sent the normal one and compare it with the encrypted one that we have
  // on the data base
  const resetToken = req.params.token;
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });
  if (!user) return next(new AppError("This token is Invalid"));
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.password = req.body.password;
  user.repeatPassword = req.body.repeatPassword;
  await user.save();

  res.status(200).json({
    message: "Your password is updated successfully",
    user,
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const updateEmitter = await User.findById(req.user.id);
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (updateEmitter.role !== "admin")
    return next(new AppError("Only Admins allow to do such an action"));

  res.status(200).json({
    message: "user is updated successfully",
    user,
  });
});

export const deactivateAccount = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new Error("Please provide The email and the Password"));

  const user = await User.findOne({ email: req.body.email });
  const correct = await user?.isCorrect(req.body.password, user.password);

  if (!user || !correct) {
    return next(
      new AppError("The Email or the Password might me inncorrect"),
      400
    );
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  const url = `http://localhost:3000/deactivate/${token}`;
  sendDeactivateEmail(user.email, url);

  res.status(200).json({
    message:
      "We have sent a token to your email , use it to deactivate your email",
  });
});

export const deactivate = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findByIdAndUpdate(decoded.id, { isActive: false });
  if (!user)
    return next(
      new AppError("The user does not exist or the TOKEN is not valid")
    );

  res.json({
    message: "Your Account is now deactivated",
  });
});

export const activateAccount = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new Error("Please provide The email and the Password"));

  const user = await User.findOne({ email: req.body.email });
  const correct = await user?.isCorrect(req.body.password, user.password);

  if (!user || !correct) {
    return next(
      new AppError("The Email or the Password might me inncorrect"),
      400
    );
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  const url = `http://localhost:3000/activate/${token}`;
  sendActivateEmail(user.email, url);

  res.status(200).json({
    message:
      "We have sent a token to your email , use it to activate your email",
  });
});

export const activate = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findByIdAndUpdate(decoded.id, { isActive: true });
  if (!user)
    return next(
      new AppError("The user does not exist or the TOKEN is not valid")
    );

  res.json({
    message: "Your Account is now Activated",
  });
});
