import express from 'express';
import { ProductModel } from '../models/Product';

const router = express.Router();

// Get price history for a product
router.get('/:productUrl/price-history', async (req, res) => {
  try {
    const productUrl = decodeURIComponent(req.params.productUrl);
    const product = await ProductModel.findOne({ productUrl });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({
      productId: product._id,
      title: product.title,
      currentPrice: product.currentPrice,
      priceHistory: product.priceHistory
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ... existing routes ...

export default router; 