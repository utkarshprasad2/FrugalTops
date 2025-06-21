import express from 'express';
import { PriceHistory } from '../models/PriceHistory';

const router = express.Router();

// Get price history for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    
    const history = await PriceHistory.getPriceHistory(productId, days);
    
    res.json({
      success: true,
      data: {
        productId,
        history,
        dataPoints: history.length
      }
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price history'
    });
  }
});

// Get price statistics for a product
router.get('/stats/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    
    const stats = await PriceHistory.getPriceStats(productId, days);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'No price history found for this product'
      });
    }
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching price stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price statistics'
    });
  }
});

// Get best deals from price history
router.get('/best-deals', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const deals = await PriceHistory.findBestDeals(days);
    
    res.json({
      success: true,
      data: {
        deals: deals.slice(0, limit),
        totalDeals: deals.length,
        timeRange: `${days} days`
      }
    });
  } catch (error) {
    console.error('Error fetching best deals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch best deals'
    });
  }
});

// Track a new price change
router.post('/track', async (req, res) => {
  try {
    const {
      productId,
      price,
      productUrl,
      retailer,
      isOnSale = false,
      originalPrice,
      availability = 'in_stock',
      metadata
    } = req.body;
    
    if (!productId || !price || !productUrl || !retailer) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: productId, price, productUrl, retailer'
      });
    }
    
    const newRecord = await PriceHistory.trackPriceChange(productId, {
      price,
      productUrl,
      retailer,
      isOnSale,
      originalPrice,
      availability,
      metadata
    });
    
    if (newRecord) {
      res.json({
        success: true,
        data: {
          message: 'Price change tracked successfully',
          record: newRecord
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          message: 'No significant price change detected',
          record: null
        }
      });
    }
  } catch (error) {
    console.error('Error tracking price change:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track price change'
    });
  }
});

// Get price alerts for a specific price threshold
router.get('/alerts/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const threshold = parseFloat(req.query.threshold as string);
    
    if (!threshold) {
      return res.status(400).json({
        success: false,
        error: 'Price threshold is required'
      });
    }
    
    const latestPrice = await PriceHistory.findOne({ productId })
      .sort({ timestamp: -1 });
    
    if (!latestPrice) {
      return res.status(404).json({
        success: false,
        error: 'No price history found for this product'
      });
    }
    
    const isBelowThreshold = latestPrice.price <= threshold;
    
    res.json({
      success: true,
      data: {
        productId,
        currentPrice: latestPrice.price,
        threshold,
        isBelowThreshold,
        alert: isBelowThreshold ? 'Price is below your threshold!' : 'Price is above your threshold',
        lastUpdated: latestPrice.timestamp
      }
    });
  } catch (error) {
    console.error('Error checking price alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check price alerts'
    });
  }
});

// Get price trends for multiple products
router.post('/trends', async (req, res) => {
  try {
    const { productIds, days = 30 } = req.body;
    
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Product IDs array is required'
      });
    }
    
    const trends = await Promise.all(
      productIds.map(async (productId: string) => {
        const stats = await PriceHistory.getPriceStats(productId, days);
        return {
          productId,
          stats
        };
      })
    );
    
    res.json({
      success: true,
      data: {
        trends,
        timeRange: `${days} days`
      }
    });
  } catch (error) {
    console.error('Error fetching price trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price trends'
    });
  }
});

export default router; 