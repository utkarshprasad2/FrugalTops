import express from 'express';
import { ProductModel } from '../models/Product';
import { Product } from '../types';

const router = express.Router();

interface RecommendationReason {
  type: 'similar_search' | 'brand_preference' | 'price_range' | 'category_interest' | 'trending';
  description: string;
  confidence: number;
}

interface RecommendedProduct {
  id: string;
  title: string;
  brand: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  retailer: string;
  rating?: number;
  reviewCount?: number;
  qualityScore?: number;
  category?: string;
  tags?: string[];
  reason: RecommendationReason;
  matchScore: number;
}

// Get personalized recommendations
router.get('/', async (req, res) => {
  try {
    const { userId, currentProductId, category, sortBy = 'relevance' } = req.query;

    // Mock recommendation algorithm - in production, this would use ML models
    const mockProducts = await ProductModel.find().limit(20);
    
    const recommendations: RecommendedProduct[] = mockProducts.map((product: any, index: number) => {
      const reasons: RecommendationReason[] = [
        {
          type: 'similar_search',
          description: 'Based on your recent searches',
          confidence: 0.85
        },
        {
          type: 'brand_preference',
          description: 'Matches your favorite brands',
          confidence: 0.92
        },
        {
          type: 'price_range',
          description: 'Within your preferred price range',
          confidence: 0.78
        },
        {
          type: 'category_interest',
          description: 'Similar to items you\'ve viewed',
          confidence: 0.88
        },
        {
          type: 'trending',
          description: 'Popular among other shoppers',
          confidence: 0.76
        }
      ];

      const reason = reasons[index % reasons.length];
      const matchScore = Math.floor(Math.random() * 30) + 70; // 70-100%

      return {
        id: product._id.toString(),
        title: product.title,
        brand: product.brand || 'Unknown',
        price: product.price,
        imageUrl: product.imageUrl,
        productUrl: product.productUrl,
        retailer: product.store,
        rating: product.rating,
        reviewCount: product.reviewCount,
        qualityScore: product.qualityScore,
        category: product.category,
        tags: product.tags,
        reason,
        matchScore
      };
    });

    // Apply category filter
    let filteredRecommendations = recommendations;
    if (category && category !== 'all') {
      filteredRecommendations = recommendations.filter(rec => 
        rec.category?.toLowerCase() === category.toString().toLowerCase()
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price':
        filteredRecommendations.sort((a, b) => a.price - b.price);
        break;
      case 'rating':
        filteredRecommendations.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filteredRecommendations.sort((a, b) => Math.random() - 0.5); // Mock newest
        break;
      default: // relevance
        filteredRecommendations.sort((a, b) => b.matchScore - a.matchScore);
    }

    res.json({
      success: true,
      recommendations: filteredRecommendations.slice(0, 12)
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations'
    });
  }
});

// Get trending products
router.get('/trending', async (req, res) => {
  try {
    const products = await ProductModel.find()
      .sort({ viewCount: -1, rating: -1 })
      .limit(10);

    const trendingProducts = products.map((product: any) => ({
      id: product._id.toString(),
      title: product.title,
      brand: product.brand || 'Unknown',
      price: product.price,
      imageUrl: product.imageUrl,
      productUrl: product.productUrl,
      retailer: product.store,
      rating: product.rating,
      trendScore: Math.floor(Math.random() * 50) + 50 // Mock trend score
    }));

    res.json({
      success: true,
      trendingProducts
    });
  } catch (error) {
    console.error('Error fetching trending products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending products'
    });
  }
});

// Get similar products
router.get('/similar/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find similar products based on category, brand, and price range
    const similarProducts = await ProductModel.find({
      _id: { $ne: productId },
      $or: [
        { category: product.category },
        { brand: product.brand },
        { 
          price: { 
            $gte: product.price * 0.7, 
            $lte: product.price * 1.3 
          } 
        }
      ]
    }).limit(8);

    res.json({
      success: true,
      similarProducts
    });
  } catch (error) {
    console.error('Error fetching similar products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch similar products'
    });
  }
});

export default router; 