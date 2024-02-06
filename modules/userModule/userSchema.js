import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  userName: String,
  email: String,
  password: String,
  repeatPassword: String,
  role: {
    type: String,
    default: "user",
  },
  phone: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  address: {
    type: Object,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  cart: {
    type: mongoose.Types.ObjectId,
    ref: "Cart",
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// encrypt the password right before saving it on the DB
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, 12);
  next();
});

// userSchema.pre("save", function (next) {
//   if (!this.isModified("cart")) return next();
//   this.cart = null;
//   next();
// });

// using instance method functions to compare the passwords
userSchema.methods.isCorrect = async (givenPassword, userPassword) => {
  return await bcrypt.compare(givenPassword, userPassword);
};

// send a usual setpassword token
userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;
