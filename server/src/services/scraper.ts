import puppeteer, { Page, ElementHandle } from 'puppeteer';
import { Product, ScrapingResult, RetailerConfigs, RetailerConfig } from '../types';
import axios from 'axios';
import cheerio from 'cheerio';
import { ProductModel } from '../models/Product';

class ScraperService {
  private retailers: RetailerConfigs = {
    'amazon': {
      url: 'https://www.amazon.com',
      searchPath: '/s?k=',
      selectors: {
        products: 'div[data-component-type="s-search-result"]',
        title: 'h2 .a-text-normal',
        price: '.a-price:not(.a-text-price) .a-offscreen',
        rating: 'span.a-icon-alt',
        reviewCount: 'span[aria-label*="stars"] + span.a-size-base',
        image: 'img.s-image',
        link: 'h2 a.a-link-normal'
      }
    },
    'target': {
      url: 'https://www.target.com',
      searchPath: '/s?searchTerm=',
      selectors: {
        products: 'div[data-test="product-card"]',
        title: '[data-test="product-title"]',
        price: '[data-test="product-price"]',
        rating: '[data-test="product-rating"]',
        reviewCount: '[data-test="product-reviews-count"]',
        image: '[data-test="product-image"] img',
        link: '[data-test="product-card-link"]'
      }
    }
  };

  private browser: puppeteer.Browser | null = null;

  async initBrowser() {
    return await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ],
      defaultViewport: {
        width: 1920,
        height: 1080
      },
      timeout: 60000
    });
  }

  private calculateQualityScore(rating: number, reviewCount: number, brand: string): number {
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

  private async extractProductData(page: Page, retailer: string): Promise<Product[]> {
    const retailerConfig = this.retailers[retailer];
    if (!retailerConfig) {
      throw new Error(`Retailer ${retailer} not configured`);
    }

    const products: Product[] = [];

    try {
      const items = await page.$$(retailerConfig.selectors.products || '');

      for (const item of items) {
        try {
          const product = await this.extractSingleProduct(item, retailerConfig, retailer);
          if (product) {
            products.push(product);
          }
        } catch (error) {
          console.error(`Error extracting product data: ${error}`);
          continue;
        }
      }
    } catch (error) {
      console.error(`Error scraping ${retailer}: ${error}`);
    }

    return products;
  }

  private async extractSingleProduct(
    item: ElementHandle<Element>,
    retailerConfig: RetailerConfig,
    retailer: string
  ): Promise<Product | null> {
    try {
      const title = await this.getElementText(item, retailerConfig.selectors.title || '');
      const priceText = await this.getElementText(item, retailerConfig.selectors.price || '');
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      const ratingText = await this.getElementText(item, retailerConfig.selectors.rating || '');
      const rating = parseFloat(ratingText.match(/\d+(\.\d+)?/)?.[0] || '0');
      const reviewCountText = await this.getElementText(item, retailerConfig.selectors.reviewCount || '');
      const reviewCount = parseInt(reviewCountText.replace(/[^0-9]/g, '') || '0');
      const imageUrl = await this.getElementAttribute(item, retailerConfig.selectors.image || '', 'src');
      const productUrl = await this.getElementAttribute(item, retailerConfig.selectors.link || '', 'href');

      if (!title || isNaN(price)) {
        return null;
      }

      // Extract brand from title
      const brandMatch = title.match(/^([A-Za-z]+)/);
      const brand = brandMatch ? brandMatch[1] : 'Unknown';

      const qualityScore = this.calculateQualityScore(rating || 0, reviewCount || 0, brand);

      return {
        id: `${retailer}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        brand,
        price,
        imageUrl,
        productUrl: productUrl || '',
        retailer,
        rating: isNaN(rating) ? undefined : rating,
        reviewCount: isNaN(reviewCount) ? undefined : reviewCount,
        qualityScore,
        dateScraped: new Date()
      };
    } catch (error) {
      console.error('Error extracting single product:', error);
      return null;
    }
  }

  private async getElementText(parent: ElementHandle<Element>, selector: string): Promise<string> {
    try {
      const element = await parent.$(selector);
      if (!element) return '';
      const text = await element.evaluate(el => el.textContent || '');
      return text.trim();
    } catch {
      return '';
    }
  }

  private async getElementAttribute(
    parent: ElementHandle<Element>,
    selector: string,
    attribute: string
  ): Promise<string> {
    try {
      const element = await parent.$(selector);
      if (!element) return '';
      const attributeValue = await element.evaluate((el, attr) => el.getAttribute(attr) || '', attribute);
      return attributeValue;
    } catch {
      return '';
    }
  }

  async searchProducts(query: string, retailer: string = 'amazon'): Promise<ScrapingResult> {
    const browser = await this.initBrowser();
    let page;
    
    try {
      page = await browser.newPage();
      
      // Block unnecessary resources
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (
          resourceType === 'document' ||
          resourceType === 'xhr' ||
          resourceType === 'fetch' ||
          resourceType === 'script'
        ) {
          req.continue();
        } else {
          req.abort();
        }
      });

      const retailerConfig = this.retailers[retailer];
      if (!retailerConfig) {
        throw new Error(`Retailer ${retailer} not configured`);
      }

      // Update Amazon selectors to be more resilient
      if (retailer === 'amazon') {
        retailerConfig.selectors = {
          products: '[data-component-type="s-search-result"]',
          title: 'span.a-text-normal',
          price: 'span.a-price span.a-offscreen',
          rating: 'span.a-icon-alt',
          reviewCount: 'span[aria-label*="stars"] + span.a-size-base',
          image: 'img.s-image',
          link: 'a.a-link-normal.s-no-outline'
        };
      }

      const searchUrl = `${retailerConfig.url}${retailerConfig.searchPath}${encodeURIComponent(query)}`;
      console.log(`Searching ${retailer} with URL: ${searchUrl}`);

      // Navigate with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      let navigationSuccess = false;

      while (retryCount < maxRetries && !navigationSuccess) {
        try {
          await page.goto(searchUrl, {
            waitUntil: ['networkidle0', 'domcontentloaded'],
            timeout: 60000
          });
          navigationSuccess = true;
        } catch (error) {
          console.log(`Navigation attempt ${retryCount + 1} failed:`, error);
          retryCount++;
          if (retryCount === maxRetries) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Wait for product elements with retry
      const productSelector = retailerConfig.selectors.products;
      if (!productSelector) {
        throw new Error(`Product selector not configured for ${retailer}`);
      }

      let productsVisible = false;
      retryCount = 0;

      while (retryCount < maxRetries && !productsVisible) {
        try {
          await page.waitForSelector(productSelector, {
            timeout: 30000,
            visible: true
          });
          productsVisible = true;
        } catch (error) {
          console.log(`Waiting for products attempt ${retryCount + 1} failed:`, error);
          retryCount++;
          if (retryCount === maxRetries) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Add a delay to ensure dynamic content is loaded
      await page.waitForTimeout(3000);

      // Scroll to load all products
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(1000);

      const products = await this.extractProductData(page, retailer);
      console.log(`Found ${products.length} products from ${retailer}`);

      if (products.length === 0) {
        // Take a screenshot for debugging
        await page.screenshot({ path: 'debug-screenshot.png' });
        console.log('No products found. Page content:', await page.content());
      }

      return {
        success: true,
        products
      };
    } catch (error: unknown) {
      console.error(`Scraping error for ${retailer}:`, error);
      if (page) {
        await page.screenshot({ path: 'error-screenshot.png' });
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: `Failed to scrape products: ${errorMessage}`
      };
    } finally {
      if (page) {
        await page.close();
      }
      await browser.close();
    }
  }

  async updateProductPriceHistory(product: any, newPrice: number) {
    product.priceHistory.push({
      price: newPrice,
      date: new Date()
    });
    product.currentPrice = newPrice;
    await product.save();
  }

  async scrapeProductDetails(url: string, page: Page): Promise<Product> {
    const product = await this.extractProductInfo(page);
    
    // Check if product already exists in database
    let existingProduct = await ProductModel.findOne({ productUrl: url });
    
    if (existingProduct) {
      // Update price history if price has changed
      if (existingProduct.currentPrice !== product.price) {
        await this.updateProductPriceHistory(existingProduct, product.price);
      }
      return existingProduct;
    }
    
    // Create new product with initial price history
    const newProduct = new ProductModel({
      ...product,
      currentPrice: product.price,
      priceHistory: [{
        price: product.price,
        date: new Date()
      }]
    });
    
    await newProduct.save();
    return newProduct;
  }
}

export const scraperService = new ScraperService(); 