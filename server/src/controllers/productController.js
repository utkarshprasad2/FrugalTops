"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = void 0;
const scraper_1 = require("../services/scraper");
const Product_1 = require("../models/Product");
exports.productController = {
    search(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { query, minPrice, maxPrice, minQualityScore, retailers = ['amazon'] } = req.query;
                if (!query) {
                    return res.status(400).json({ error: 'Search query is required' });
                }
                // Search in database first
                const dbQuery = {
                    title: { $regex: query, $options: 'i' }
                };
                if (minPrice !== undefined) {
                    dbQuery.price = { $gte: minPrice };
                }
                if (maxPrice !== undefined) {
                    dbQuery.price = Object.assign(Object.assign({}, dbQuery.price), { $lte: maxPrice });
                }
                if (minQualityScore !== undefined) {
                    dbQuery.qualityScore = { $gte: minQualityScore };
                }
                const cachedResults = yield Product_1.ProductModel.find(dbQuery)
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
                const scrapingPromises = retailers.map(retailer => scraper_1.scraperService.searchProducts(query, retailer));
                const scrapingResults = yield Promise.all(scrapingPromises);
                const newProducts = scrapingResults.flatMap(result => result.success && result.products ? result.products : []);
                // Save new products to database
                if (newProducts.length > 0) {
                    yield Product_1.ProductModel.insertMany(newProducts);
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
                    if (qualityDiff !== 0)
                        return qualityDiff;
                    return a.price - b.price;
                });
                return res.json({
                    success: true,
                    products: sortedProducts.slice(0, 20),
                    source: 'mixed'
                });
            }
            catch (error) {
                console.error('Search error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to search products'
                });
            }
        });
    },
    getFilters(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const brands = yield Product_1.ProductModel.distinct('brand');
                const retailers = yield Product_1.ProductModel.distinct('retailer');
                const priceRange = yield Product_1.ProductModel.aggregate([
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
            }
            catch (error) {
                console.error('Get filters error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to get filters'
                });
            }
        });
    }
};
