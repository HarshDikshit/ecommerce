import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  clerkId: { type: String, required: true, unique: true }, // Link to Clerk user ID
  name: { type: String, required: true },
  avatarUrl: { type: String }, // From Google or Cloudinary
  email: { type: String, required: true, unique: true },
  cart: [{ type: Schema.Types.ObjectId, ref: 'Product' }], // Array of product IDs
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  orders: [{
    orderId: { type: String },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    total: { type: Number },
    status: { type: String, enum: ['Pending', 'Shipped', 'Delivered'], default: 'Pending' },
    date: { type: Date, default: Date.now },
  }],
  reviews: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    date: { type: Date, default: Date.now },
  }],
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zip: { type: String },
  },
  contactNumber: { type: String },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;