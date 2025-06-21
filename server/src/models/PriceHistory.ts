import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPriceHistory extends Document {
  productId: string;
  productUrl: string;
  retailer: string;
  price: number;
  currency: string;
  timestamp: Date;
  isOnSale: boolean;
  originalPrice?: number;
  discountPercentage?: number;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  metadata?: {
    brand?: string;
    category?: string;
    size?: string;
    color?: string;
  };
}

interface IPriceHistoryModel extends Model<IPriceHistory> {
  getPriceHistory(productId: string, days?: number): Promise<IPriceHistory[]>;
  getPriceStats(productId: string, days?: number): Promise<any>;
  findBestDeals(days?: number): Promise<any[]>;
  trackPriceChange(productId: string, productData: any): Promise<IPriceHistory | null>;
}

const PriceHistorySchema = new Schema<IPriceHistory>({
  productId: {
    type: String,
    required: true,
    index: true
  },
  productUrl: {
    type: String,
    required: true
  },
  retailer: {
    type: String,
    required: true,
    index: true
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  originalPrice: {
    type: Number
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  availability: {
    type: String,
    enum: ['in_stock', 'out_of_stock', 'limited'],
    default: 'in_stock'
  },
  metadata: {
    brand: String,
    category: String,
    size: String,
    color: String
  }
});

// Compound index for efficient queries
PriceHistorySchema.index({ productId: 1, timestamp: -1 });
PriceHistorySchema.index({ retailer: 1, timestamp: -1 });
PriceHistorySchema.index({ isOnSale: 1, timestamp: -1 });

// Virtual for calculating price change
PriceHistorySchema.virtual('priceChange').get(function() {
  // This would be calculated when querying multiple records
  return null;
});

// Static method to get price history for a product
PriceHistorySchema.statics.getPriceHistory = async function(productId: string, days: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({
    productId,
    timestamp: { $gte: cutoffDate }
  }).sort({ timestamp: 1 });
};

// Static method to get price statistics
PriceHistorySchema.statics.getPriceStats = async function(productId: string, days: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const history = await this.find({
    productId,
    timestamp: { $gte: cutoffDate }
  }).sort({ timestamp: 1 });
  
  if (history.length === 0) {
    return null;
  }
  
  const prices = history.map((h: IPriceHistory) => h.price);
  const currentPrice = history[history.length - 1].price;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length;
  
  return {
    currentPrice,
    minPrice,
    maxPrice,
    avgPrice,
    priceRange: maxPrice - minPrice,
    priceChange: currentPrice - history[0].price,
    priceChangePercentage: ((currentPrice - history[0].price) / history[0].price) * 100,
    dataPoints: history.length,
    lastUpdated: history[history.length - 1].timestamp
  };
};

// Static method to find best deals
PriceHistorySchema.statics.findBestDeals = async function(days: number = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: cutoffDate },
        isOnSale: true
      }
    },
    {
      $group: {
        _id: '$productId',
        currentPrice: { $last: '$price' },
        originalPrice: { $last: '$originalPrice' },
        discountPercentage: { $last: '$discountPercentage' },
        retailer: { $last: '$retailer' },
        productUrl: { $last: '$productUrl' },
        lastUpdated: { $last: '$timestamp' },
        priceHistory: { $push: { price: '$price', timestamp: '$timestamp' } }
      }
    },
    {
      $sort: { discountPercentage: -1 }
    },
    {
      $limit: 20
    }
  ]);
};

// Static method to track price changes
PriceHistorySchema.statics.trackPriceChange = async function(
  productId: string,
  productData: {
    price: number;
    productUrl: string;
    retailer: string;
    isOnSale?: boolean;
    originalPrice?: number;
    availability?: string;
    metadata?: any;
  }
) {
  const latestRecord = await this.findOne({ productId }).sort({ timestamp: -1 });
  
  // Check if price has changed significantly (more than 1% or $1)
  const hasSignificantChange = !latestRecord || 
    Math.abs(productData.price - latestRecord.price) > 1 ||
    Math.abs((productData.price - latestRecord.price) / latestRecord.price) > 0.01;
  
  if (hasSignificantChange) {
    const discountPercentage = productData.originalPrice && productData.price < productData.originalPrice
      ? ((productData.originalPrice - productData.price) / productData.originalPrice) * 100
      : undefined;
    
    return this.create({
      productId,
      productUrl: productData.productUrl,
      retailer: productData.retailer,
      price: productData.price,
      isOnSale: productData.isOnSale || false,
      originalPrice: productData.originalPrice,
      discountPercentage,
      availability: productData.availability || 'in_stock',
      metadata: productData.metadata
    });
  }
  
  return null;
};

export const PriceHistory = mongoose.model<IPriceHistory, IPriceHistoryModel>('PriceHistory', PriceHistorySchema); 