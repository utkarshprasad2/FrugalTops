import express from 'express';
import { PriceAlertModel } from '../models/PriceAlert';
import { ProductModel } from '../models/Product';

const router = express.Router();

// Get all price alerts for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const alerts = await PriceAlertModel.find({ userId })
      .populate('productId')
      .sort({ createdAt: -1 });
    
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching price alerts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new price alert
router.post('/', async (req, res) => {
  try {
    const { userId, productId, targetPrice } = req.body;
    
    // Verify product exists and get current price
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Create price alert
    const priceAlert = new PriceAlertModel({
      userId,
      productId,
      targetPrice,
      currentPrice: product.currentPrice,
      isActive: true
    });
    
    await priceAlert.save();
    res.status(201).json(priceAlert);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'Price alert already exists for this product' });
    }
    console.error('Error creating price alert:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a price alert
router.patch('/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { targetPrice, isActive } = req.body;
    
    const alert = await PriceAlertModel.findById(alertId);
    if (!alert) {
      return res.status(404).json({ message: 'Price alert not found' });
    }
    
    if (targetPrice !== undefined) alert.targetPrice = targetPrice;
    if (isActive !== undefined) alert.isActive = isActive;
    
    await alert.save();
    res.json(alert);
  } catch (error) {
    console.error('Error updating price alert:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a price alert
router.delete('/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    
    const alert = await PriceAlertModel.findByIdAndDelete(alertId);
    if (!alert) {
      return res.status(404).json({ message: 'Price alert not found' });
    }
    
    res.json({ message: 'Price alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting price alert:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 