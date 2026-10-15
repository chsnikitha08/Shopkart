import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // bcrypt hash only. Hidden from queries unless explicitly selected.
    password: { type: String, required: true, select: false },
    phone: { type: String, required: true, trim: true },

    // Lab 04: product references only (no copied product data)
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    // Lab 05: product reference + quantity
    cart: { type: [cartItemSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model("Customer", customerSchema);
