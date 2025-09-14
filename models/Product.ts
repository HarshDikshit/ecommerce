import mongoose, { Schema } from 'mongoose';

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  variant: { type: String, enum: ['mala', 'bracelet', 'gemstone', 'rudraksha'], required: true },
  category: { type: String }, // Optional
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 }, // Percentage
  images: [{ type: String }], // Cloudinary URLs
  reviews: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    date: { type: Date, default: Date.now },
  }],
  stock: { type: Number, default: 0 },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;