import { Request, Response } from 'express';
import { scraperService } from '../services/scraper';
import { ProductModel } from '../models/Product';
import { SearchQuery } from '../types';

export const productController = {
  async search(req: Request<{}, {}, {}, SearchQuery>, res: Response) {
    try {
      const { query, minPrice, maxPrice, minQualityScore, retailers = ['amazon'] } = req.query;

      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      // Search in database first
      const dbQuery: any = {
        title: { $regex: query, $options: 'i' }
      };

      if (minPrice !== undefined) {
        dbQuery.price = { $gte: minPrice };
      }
      if (maxPrice !== undefined) {
        dbQuery.price = { ...dbQuery.price, $lte: maxPrice };
      }
      if (minQualityScore !== undefined) {
        dbQuery.qualityScore = { $gte: minQualityScore };
      }

      const cachedResults = await ProductModel.find(dbQuery)
        .sort({ qualityScore: -1, price: 1 })
        .limit(20);

      // If we have enough recent results, return them
      if (cachedResults.length >= 10) {
        return res.json({
          success: true,
          products: cachedResults,
          source: 'cache'
        });
      }

      // Otherwise, scrape new results
      const scrapingPromises = retailers.map(retailer =>
        scraperService.searchProducts(query, retailer)
      );

      const scrapingResults = await Promise.all(scrapingPromises);
      const newProducts = scrapingResults.flatMap(result =>
        result.success && result.products ? result.products : []
      );

      // Save new products to database
      if (newProducts.length > 0) {
        await ProductModel.insertMany(newProducts);
      }

      // Combine and filter results
      const allProducts = [...cachedResults, ...newProducts];
      const filteredProducts = allProducts.filter(product => {
        const meetsMinPrice = minPrice === undefined || product.price >= minPrice;
        const meetsMaxPrice = maxPrice === undefined || product.price <= maxPrice;
        const meetsQualityScore = minQualityScore === undefined || 
          (product.qualityScore !== undefined && product.qualityScore >= minQualityScore);
        
        return meetsMinPrice && meetsMaxPrice && meetsQualityScore;
      });

      // Sort by quality score and price
      const sortedProducts = filteredProducts.sort((a, b) => {
        const qualityDiff = (b.qualityScore || 0) - (a.qualityScore || 0);
        if (qualityDiff !== 0) return qualityDiff;
        return a.price - b.price;
      });

      return res.json({
        success: true,
        products: sortedProducts.slice(0, 20),
        source: 'mixed'
      });
    } catch (error) {
      console.error('Search error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to search products'
      });
    }
  },

  async getFilters(req: Request, res: Response) {
    try {
      const brands = await ProductModel.distinct('brand');
      const retailers = await ProductModel.distinct('retailer');
      const priceRange = await ProductModel.aggregate([
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        }
      ]);

      return res.json({
        success: true,
        filters: {
          brands,
          retailers,
          priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000 }
        }
      });
    } catch (error) {
      console.error('Get filters error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get filters'
      });
    }
  }
}; 