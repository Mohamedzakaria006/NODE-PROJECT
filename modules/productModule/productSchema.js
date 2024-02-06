import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema({
  productName: String,
  price: Number,
  slug: String,
  finalPrice: Number,
  image: String,
  category: {
    type: mongoose.Types.ObjectId,
    ref: "Category",
  },
  stock: Number,
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
});

productSchema.pre("save", function (next) {
  this.slug = slugify(this.productName, { replacement: "_", lower: true });
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
