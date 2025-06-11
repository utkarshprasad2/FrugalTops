import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { scraperService } from './services/scraper';
import productsRouter from './routes/products';
import wishlistRouter from './routes/wishlist';
import priceAlertsRouter from './routes/priceAlerts';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productsRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/price-alerts', priceAlertsRouter);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/frugaltops')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Search products endpoint
app.get('/api/products/search', async (req, res) => {
  try {
    const query = req.query.query as string;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    console.log(`Received search request for: "${query}"`);
    
    const result = await scraperService.searchProducts(query);
    
    if (!result.success) {
      console.error('Scraping failed:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    if (!result.products || result.products.length === 0) {
      console.log('No products found for query:', query);
      return res.json({
        success: true,
        products: [],
        message: 'No products found. Try a different search term.'
      });
    }

    console.log(`Found ${result.products.length} products for query: "${query}"`);
    res.json({
      success: true,
      products: result.products
    });
  } catch (error) {
    console.error('Server error during product search:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error occurred while searching for products'
    });
  }
}); 