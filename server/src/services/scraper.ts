import puppeteer, { Page, ElementHandle } from 'puppeteer';
import { Product, ScrapingResult, RetailerConfigs, RetailerConfig } from '../types';

class ScraperService {
  private retailers: RetailerConfigs = {
    'amazon': {
      url: 'https://www.amazon.com',
      searchPath: '/s?k=',
      selectors: {
        products: 'div[data-component-type="s-search-result"]',
        title: 'h2 a.a-link-normal span',
        price: 'span.a-price span.a-offscreen',
        rating: 'span[aria-label*="stars"]',
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

  async initBrowser() {
    return await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
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
    
    try {
      const page = await browser.newPage();
      
      // Set viewport and user agent
      await page.setViewport({ width: 1280, height: 800 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      const retailerConfig = this.retailers[retailer];
      if (!retailerConfig) {
        throw new Error(`Retailer ${retailer} not configured`);
      }

      await page.goto(`${retailerConfig.url}${retailerConfig.searchPath}${encodeURIComponent(query)}`, {
        waitUntil: 'networkidle0'
      });

      const products = await this.extractProductData(page, retailer);

      return {
        success: true,
        products
      };
    } catch (error) {
      console.error(`Scraping error: ${error}`);
      return {
        success: false,
        error: 'Failed to scrape products'
      };
    } finally {
      await browser.close();
    }
  }
}

export const scraperService = new ScraperService(); 