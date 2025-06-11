import mongoose from 'mongoose';

export interface PriceAlert {
  userId: string;
  productId: mongoose.Types.ObjectId;
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  createdAt: Date;
  lastChecked: Date;
  notificationSent: boolean;
}

const priceAlertSchema = new mongoose.Schema<PriceAlert>({
  userId: {
    type: String,
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  targetPrice: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastChecked: {
    type: Date,
    default: Date.now
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
});

// Create a compound index for userId and productId
priceAlertSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const PriceAlertModel = mongoose.model<PriceAlert>('PriceAlert', priceAlertSchema); 