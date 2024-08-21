import mongoose from "mongoose";

const productsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  quantity: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
  isAvailable: { type: Boolean, default: true },
});

const Product = mongoose.model("Products", productsSchema);
export default Product;
