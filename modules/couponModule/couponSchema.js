import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    min: 1,
    max: 100,
    required: true,
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  deletedBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  expiresIn: {
    type: Date,
    required: true,
  },
  isValid: {
    type: Boolean,
    default: true,
  },
  product: {
    type: mongoose.Types.ObjectId,
    ref: "Product",
  },
});

const Coupon = new mongoose.model("Coupon", couponSchema);

export default Coupon;
