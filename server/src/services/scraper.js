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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scraperService = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
class ScraperService {
    constructor() {
        this.retailers = {
            'amazon': {
                url: 'https://www.amazon.com',
                searchPath: '/s?k=',
                selectors: {
                    products: '.s-result-item[data-component-type="s-search-result"]',
                    title: 'h2 .a-link-normal',
                    price: '.a-price .a-offscreen',
                    rating: '.a-icon-star-small .a-icon-alt',
                    reviewCount: '.a-size-base.s-underline-text',
                    image: '.s-image',
                }
            },
            'target': {
                url: 'https://www.target.com',
                searchPath: '/s?searchTerm=',
                selectors: {}
            }
        };
    }
    initBrowser() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield puppeteer_1.default.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        });
    }
    calculateQualityScore(rating, reviewCount, brand) {
        // Basic quality score algorithm
        // Scale: 0-10
        // Factors:
        // - Rating (50% weight)
        // - Review count (30% weight)
        // - Brand reputation (20% weight)
        const ratingScore = (rating / 5) * 5; // Convert to 0-5 scale
        // Log scale for review count (0-2.5 points)
        const reviewScore = Math.min(Math.log10(reviewCount) * 0.8, 3);
        // Simplified brand score (TODO: implement proper brand reputation database)
        const brandScore = brand.toLowerCase().includes('premium') ? 2 : 1;
        return Math.min(ratingScore + reviewScore + brandScore, 10);
    }
    extractProductData(page, retailer) {
        return __awaiter(this, void 0, void 0, function* () {
            const retailerConfig = this.retailers[retailer];
            if (!retailerConfig) {
                throw new Error(`Retailer ${retailer} not configured`);
            }
            const products = [];
            try {
                const items = yield page.$$(retailerConfig.selectors.products || '');
                for (const item of items) {
                    try {
                        const product = yield this.extractSingleProduct(item, retailerConfig, retailer);
                        if (product) {
                            products.push(product);
                        }
                    }
                    catch (error) {
                        console.error(`Error extracting product data: ${error}`);
                        continue;
                    }
                }
            }
            catch (error) {
                console.error(`Error scraping ${retailer}: ${error}`);
            }
            return products;
        });
    }
    extractSingleProduct(item, retailerConfig, retailer) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const title = yield this.getElementText(item, retailerConfig.selectors.title || '');
                const priceText = yield this.getElementText(item, retailerConfig.selectors.price || '');
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                const ratingText = yield this.getElementText(item, retailerConfig.selectors.rating || '');
                const rating = parseFloat(ratingText.split(' ')[0]);
                const reviewCountText = yield this.getElementText(item, retailerConfig.selectors.reviewCount || '');
                const reviewCount = parseInt(reviewCountText.replace(/[^0-9]/g, ''));
                const imageUrl = yield this.getElementAttribute(item, retailerConfig.selectors.image || '', 'src');
                if (!title || isNaN(price)) {
                    return null;
                }
                const qualityScore = this.calculateQualityScore(rating || 0, reviewCount || 0, title);
                return {
                    id: `${retailer}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    title,
                    brand: 'TBD', // TODO: Extract brand information
                    price,
                    imageUrl,
                    productUrl: '', // TODO: Extract product URL
                    retailer,
                    rating: isNaN(rating) ? undefined : rating,
                    reviewCount: isNaN(reviewCount) ? undefined : reviewCount,
                    qualityScore,
                    dateScraped: new Date()
                };
            }
            catch (error) {
                console.error('Error extracting single product:', error);
                return null;
            }
        });
    }
    getElementText(parent, selector) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const element = yield parent.$(selector);
                if (!element)
                    return '';
                const text = yield element.evaluate(el => el.textContent || '');
                return text.trim();
            }
            catch (_a) {
                return '';
            }
        });
    }
    getElementAttribute(parent, selector, attribute) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const element = yield parent.$(selector);
                if (!element)
                    return '';
                const attributeValue = yield element.evaluate((el, attr) => el.getAttribute(attr) || '', attribute);
                return attributeValue;
            }
            catch (_a) {
                return '';
            }
        });
    }
    searchProducts(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, retailer = 'amazon') {
            const browser = yield this.initBrowser();
            try {
                const page = yield browser.newPage();
                // Set viewport and user agent
                yield page.setViewport({ width: 1280, height: 800 });
                yield page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
                const retailerConfig = this.retailers[retailer];
                if (!retailerConfig) {
                    throw new Error(`Retailer ${retailer} not configured`);
                }
                yield page.goto(`${retailerConfig.url}${retailerConfig.searchPath}${encodeURIComponent(query)}`, {
                    waitUntil: 'networkidle0'
                });
                const products = yield this.extractProductData(page, retailer);
                return {
                    success: true,
                    products
                };
            }
            catch (error) {
                console.error(`Scraping error: ${error}`);
                return {
                    success: false,
                    error: 'Failed to scrape products'
                };
            }
            finally {
                yield browser.close();
            }
        });
    }
}
exports.scraperService = new ScraperService();
