import mongoose from 'mongoose';
import { Product } from '../types';

const productSchema = new mongoose.Schema<Product>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  description: { type: String },
  imageUrl: { type: String, required: true },
  productUrl: { type: String, required: true },
  retailer: { type: String, required: true },
  rating: { type: Number },
  reviewCount: { type: Number },
  qualityScore: { type: Number },
  sizes: [{ type: String }],
  colors: [{ type: String }],
  dateScraped: { type: Date, default: Date.now }
});

// Create indexes for common queries
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ qualityScore: 1 });
productSchema.index({ title: 'text' });

export const ProductModel = mongoose.model<Product>('Product', productSchema); 