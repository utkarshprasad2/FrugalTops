import express from 'express';
import { ProductModel } from '../models/Product';

const router = express.Router();

interface DealAlert {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  currentPrice: number;
  targetPrice: number;
  retailer: string;
  alertType: 'price_drop' | 'new_deal' | 'back_in_stock' | 'flash_sale';
  status: 'active' | 'triggered' | 'expired';
  createdAt: Date;
  triggeredAt?: Date;
  userId: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

// Mock data storage - in production, this would be a MongoDB collection
let dealAlerts: DealAlert[] = [];

// Get deal alerts for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const userAlerts = dealAlerts.filter(alert => alert.userId === userId);
    
    res.json({
      success: true,
      alerts: userAlerts
    });
  } catch (error) {
    console.error('Error fetching deal alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deal alerts'
    });
  }
});

// Create a new deal alert
router.post('/', async (req, res) => {
  try {
    const {
      productId,
      productTitle,
      productImage,
      currentPrice,
      targetPrice,
      retailer,
      alertType,
      userId,
      notificationPreferences
    } = req.body;

    // Validate required fields
    if (!productId || !targetPrice || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, target price, and user ID are required'
      });
    }

    const newAlert: DealAlert = {
      id: Date.now().toString(),
      productId,
      productTitle,
      productImage,
      currentPrice,
      targetPrice,
      retailer,
      alertType: alertType || 'price_drop',
      status: 'active',
      createdAt: new Date(),
      userId,
      notificationPreferences: notificationPreferences || {
        email: true,
        push: true,
        sms: false
      }
    };

    dealAlerts.push(newAlert);

    res.json({
      success: true,
      alert: newAlert
    });
  } catch (error) {
    console.error('Error creating deal alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create deal alert'
    });
  }
});

// Update a deal alert
router.put('/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    const updates = req.body;

    const alertIndex = dealAlerts.findIndex(alert => alert.id === alertId);
    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Deal alert not found'
      });
    }

    dealAlerts[alertIndex] = {
      ...dealAlerts[alertIndex],
      ...updates
    };

    res.json({
      success: true,
      alert: dealAlerts[alertIndex]
    });
  } catch (error) {
    console.error('Error updating deal alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update deal alert'
    });
  }
});

// Delete a deal alert
router.delete('/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;

    const alertIndex = dealAlerts.findIndex(alert => alert.id === alertId);
    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Deal alert not found'
      });
    }

    dealAlerts.splice(alertIndex, 1);

    res.json({
      success: true,
      message: 'Deal alert deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting deal alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete deal alert'
    });
  }
});

// Check for triggered alerts (this would typically run as a background job)
router.post('/check-triggers', async (req, res) => {
  try {
    const triggeredAlerts: DealAlert[] = [];

    for (const alert of dealAlerts) {
      if (alert.status !== 'active') continue;

      // Get current product price
      const product = await ProductModel.findById(alert.productId);
      if (!product) continue;

      const currentPrice = product.price;
      let shouldTrigger = false;

      switch (alert.alertType) {
        case 'price_drop':
          shouldTrigger = currentPrice <= alert.targetPrice;
          break;
        case 'new_deal':
          // Check if price dropped significantly (e.g., 20% or more)
          const priceDrop = ((alert.currentPrice - currentPrice) / alert.currentPrice) * 100;
          shouldTrigger = priceDrop >= 20;
          break;
        case 'back_in_stock':
          // This would require stock checking logic
          shouldTrigger = false; // Placeholder
          break;
        case 'flash_sale':
          // Check if it's a flash sale (e.g., limited time, significant discount)
          shouldTrigger = false; // Placeholder
          break;
      }

      if (shouldTrigger) {
        alert.status = 'triggered';
        alert.triggeredAt = new Date();
        triggeredAlerts.push(alert);

        // In production, send notifications here
        console.log(`Alert triggered for ${alert.productTitle} at ${currentPrice}`);
      }
    }

    res.json({
      success: true,
      triggeredAlerts: triggeredAlerts.length,
      message: `Checked ${dealAlerts.length} alerts, triggered ${triggeredAlerts.length}`
    });
  } catch (error) {
    console.error('Error checking alert triggers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check alert triggers'
    });
  }
});

// Get alert statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const userAlerts = dealAlerts.filter(alert => alert.userId === userId);
    
    const stats = {
      total: userAlerts.length,
      active: userAlerts.filter(a => a.status === 'active').length,
      triggered: userAlerts.filter(a => a.status === 'triggered').length,
      expired: userAlerts.filter(a => a.status === 'expired').length,
      averageSavings: 0,
      totalSavings: 0
    };

    // Calculate savings
    const triggeredAlerts = userAlerts.filter(a => a.status === 'triggered');
    if (triggeredAlerts.length > 0) {
      const totalSavings = triggeredAlerts.reduce((sum, alert) => {
        return sum + (alert.currentPrice - alert.targetPrice);
      }, 0);
      
      stats.totalSavings = totalSavings;
      stats.averageSavings = totalSavings / triggeredAlerts.length;
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching alert statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert statistics'
    });
  }
});

// Get recent deals for creating alerts
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