import express from 'express';
import { WishlistModel } from '../models/Wishlist';
import { ProductModel } from '../models/Product';

const router = express.Router();

// Get user's wishlist
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const wishlist = await WishlistModel.findOne({ userId }).populate('products');
    
    if (!wishlist) {
      return res.json({ products: [] });
    }
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add product to wishlist
router.post('/:userId/products/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    // Verify product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find or create wishlist
    let wishlist = await WishlistModel.findOne({ userId });
    if (!wishlist) {
      wishlist = new WishlistModel({ userId, products: [] });
    }
    
    // Add product if not already in wishlist
    if (!wishlist.products.includes(product._id)) {
      wishlist.products.push(product._id);
      await wishlist.save();
    }
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove product from wishlist
router.delete('/:userId/products/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    const wishlist = await WishlistModel.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
    await wishlist.save();
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 