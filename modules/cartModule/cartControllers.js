import AppError from "../../utils/appError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import User from "../userModule/userSchema.js";
import Cart from "./cartSchema.js";
import Product from "../productModule/productSchema.js";
import mongoose from "mongoose";

export const createCart = catchAsync(async (req, res, next) => {
  const ownerUser = await User.findById(req.user.id);
  if (!ownerUser) return next(new AppError("This user is not exist", 400));
  if (ownerUser.cart) return next(new AppError("You have already a Cart", 400));
  const cart = await Cart.create(req.body);

  ownerUser.cart = cart.id;
  cart.user = ownerUser.id;
  await cart.save();
  await ownerUser.save();

  res.status(201).json({
    status: "success",
    message: "Cart is created successfully",
  });
});

export const addProductToCart = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.user.id);
  const currentCart = await Cart.findById(currentUser.cart);
  const product = await Product.findById(req.params.id);
  if (!currentUser) return next(new AppError("This user is not found"), 400);
  if (!currentUser.cart)
    return next(new AppError("You have to create a cart first"), 400);

  const addedProduct = currentCart.products.find(
    (el) => el._id.toString() === product._id.toString()
  );
  const productIndex = currentCart.products.indexOf(addedProduct);

  if (productIndex !== -1) {
    currentCart.products[productIndex].quantity += req.body.quantity || 1;
  } else {
    await Cart.findOneAndUpdate(
      { _id: currentUser.cart },
      {
        $push: {
          products: {
            _id: req.params.id,
            quantity: req.body.quantity || 1,
            price: product.price,
          },
        },
      }
    );
  }
  await Cart.findOneAndUpdate(
    { _id: currentUser.cart },
    {
      $inc: {
        totalPrice: req.body.quantity || 1 * product.price,
        finalPrice: req.body.quantity || 1 * product.finalPrice,
      },
    }
  );

  await currentCart.save();
  res.status(200).json({
    status: "success",
    message: "Product is added to your cart successfuly",
  });
});

export const deleteProductFromCart = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.user.id);
  const currentCart = await Cart.findById(currentUser.cart);
  const product = await Product.findById(req.params.id);
  if (!currentUser) return next(new AppError("This user is not found"), 400);

  const removedProduct = currentCart.products.find(
    (el) => el._id.toString() === product._id.toString()
  );
  console.log(removedProduct);
  console.log(product);
  const productIndex = currentCart.products.indexOf(removedProduct);

  if (removedProduct.quantity > 1) {
    currentCart.products[productIndex].quantity -= 1;
  } else if (removedProduct.quantity == 1) {
    currentCart.products.splice(removedProduct, 1);
  }

  await Cart.findOneAndUpdate(
    { _id: currentUser.cart },
    {
      $inc: {
        totalPrice: -product.price,
        finalPrice: -product.finalPrice,
      },
    }
  );

  if (currentCart.products.length === 0) {
    currentCart.totalPrice = 0;
    currentCart.finalPrice = 0;
  }

  await currentCart.save();
  res.status(200).json({
    status: "success",
    message: "Product is deleted from your cart successfuly",
  });
});

export const getAllCartProducts = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.user.id);
  const cart = await Cart.findById(currentUser.cart).populate({
    path: "products",
    select: "-__v",
  });

  if (!currentUser) return next(new AppError("This user is not found"), 400);
  if (!currentUser.cart)
    return next(new AppError("You have to create a cart first"), 400);

  res.status(200).json({
    status: "message",
    results: cart.products.length,
    cart,
  });
});
