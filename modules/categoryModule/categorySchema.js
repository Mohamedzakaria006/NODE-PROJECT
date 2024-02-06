import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  categoryName: String,
  image: String,
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
