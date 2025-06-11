export interface PricePoint {
  price: number;
  date: Date;
}

export interface Product {
  title: string;
  price: number;
  currentPrice: number;
  imageUrl: string;
  productUrl: string;
  store: string;
  description?: string;
  brand?: string;
  category?: string;
  sizes?: string[];
  colors?: string[];
  dateScraped: Date;
  priceHistory: PricePoint[];
}

export interface ScrapingResult {
  products: Product[];
  totalProducts: number;
}

export interface RetailerConfig {
  name: string;
  baseUrl: string;
  searchUrl: string;
  selectors: {
    productCard: string;
    title: string;
    price: string;
    image: string;
    link: string;
  };
}

export interface RetailerConfigs {
  [key: string]: RetailerConfig;
} 