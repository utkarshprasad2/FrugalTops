import express from 'express';
import { ProductModel } from '../models/Product';

const router = express.Router();

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  helpfulCount: number;
  createdAt: Date;
  images?: string[];
  verified: boolean;
}

interface SharedDeal {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  retailer: string;
  sharedBy: string;
  sharedByAvatar?: string;
  shareReason: string;
  shareCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  tags: string[];
}

// Mock data storage - in production, these would be MongoDB collections
let reviews: Review[] = [];
let sharedDeals: SharedDeal[] = [];

// Get reviews for a product
router.get('/reviews', async (req, res) => {
  try {
    const { productId } = req.query;
    
    const productReviews = reviews.filter(review => review.productId === productId);
    
    res.json({
      success: true,
      reviews: productReviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// Create a new review
router.post('/reviews', async (req, res) => {
  try {
    const { productId, userId, userName, rating, title, content } = req.body;

    const newReview: Review = {
      id: Date.now().toString(),
      productId,
      userId,
      userName,
      rating,
      title,
      content,
      helpfulCount: 0,
      createdAt: new Date(),
      verified: false
    };

    reviews.push(newReview);

    res.json({
      success: true,
      review: newReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review'
    });
  }
});

// Mark review as helpful/unhelpful
router.post('/reviews/:reviewId/:action', async (req, res) => {
  try {
    const { reviewId, action } = req.params;
    
    const review = reviews.find(r => r.id === reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (action === 'helpful') {
      review.helpfulCount += 1;
    } else if (action === 'unhelpful') {
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    }

    res.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
});

// Get shared deals for a product
router.get('/shares', async (req, res) => {
  try {
    const { productId } = req.query;
    
    const productShares = sharedDeals.filter(share => share.productId === productId);
    
    res.json({
      success: true,
      shares: productShares
    });
  } catch (error) {
    console.error('Error fetching shared deals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared deals'
    });
  }
});

// Create a new shared deal
router.post('/shares', async (req, res) => {
  try {
    const { productId, userId, userName, shareReason, tags } = req.body;

    // Get product details
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const newShare: SharedDeal = {
      id: Date.now().toString(),
      productId,
      productTitle: product.title,
      productImage: product.imageUrl,
      productPrice: product.price,
      retailer: product.store,
      sharedBy: userName,
      shareReason,
      shareCount: 0,
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date(),
      tags: tags || []
    };

    sharedDeals.push(newShare);

    res.json({
      success: true,
      share: newShare
    });
  } catch (error) {
    console.error('Error creating shared deal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shared deal'
    });
  }
});

// Like/unlike a shared deal
router.post('/shares/:shareId/:action', async (req, res) => {
  try {
    const { shareId, action } = req.params;
    
    const share = sharedDeals.find(s => s.id === shareId);
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Shared deal not found'
      });
    }

    if (action === 'like') {
      share.likeCount += 1;
    } else if (action === 'unlike') {
      share.likeCount = Math.max(0, share.likeCount - 1);
    }

    res.json({
      success: true,
      share
    });
  } catch (error) {
    console.error('Error updating shared deal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shared deal'
    });
  }
});

// Get trending shared deals
router.get('/trending', async (req, res) => {
  try {
    const trendingShares = sharedDeals
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 10);
    
    res.json({
      success: true,
      shares: trendingShares
    });
  } catch (error) {
    console.error('Error fetching trending shares:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending shares'
    });
  }
});

// Get recent deals for sharing
router.get('/recent-deals', async (req, res) => {
  try {
    const recentProducts = await ProductModel.find()
      .sort({ dateScraped: -1 })
      .limit(20);

    const deals = recentProducts.map((product: any) => ({
      id: product._id.toString(),
      title: product.title,
      brand: product.brand || 'Unknown',
      price: product.price,
      imageUrl: product.imageUrl,
      productUrl: product.productUrl,
      retailer: product.store,
      rating: product.rating
    }));

    res.json({
      success: true,
      deals
    });
  } catch (error) {
    console.error('Error fetching recent deals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent deals'
    });
  }
});

export default router; 