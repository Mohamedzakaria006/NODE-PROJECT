import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  products: [
    {
      productId: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        default: 1,
      },
      price: Number,
      finalPrice: Number,
    },
  ],
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  finalPrice: {
    type: Number,
    default: 0,
  },
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
