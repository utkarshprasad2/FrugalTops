import mongoose from 'mongoose';
import { Product } from '../types';

export interface Wishlist {
  userId: string;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new mongoose.Schema<Wishlist>({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
wishlistSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const WishlistModel = mongoose.model<Wishlist>('Wishlist', wishlistSchema); 