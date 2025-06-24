import mongoose from 'mongoose';
import { Product, PricePoint } from '../types';

const priceHistorySchema = new mongoose.Schema<PricePoint>({
  price: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const productSchema = new mongoose.Schema<Product>({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  productUrl: {
    type: String,
    required: true,
    unique: true
  },
  store: {
    type: String,
    required: true
  },
  description: String,
  brand: String,
  category: String,
  sizes: [String],
  colors: [String],
  dateScraped: {
    type: Date,
    default: Date.now
  },
  priceHistory: [priceHistorySchema]
});

// Create indexes for common queries
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ qualityScore: 1 });
productSchema.index({ title: 'text' });

export const ProductModel = mongoose.model<Product>('Product', productSchema);

export { Product }; 