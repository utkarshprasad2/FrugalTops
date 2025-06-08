export interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  description?: string;
  imageUrl: string;
  productUrl: string;
  retailer: string;
  rating?: number;
  reviewCount?: number;
  qualityScore?: number;
  sizes?: string[];
  colors?: string[];
  dateScraped: Date;
}

export interface SearchQuery {
  query: string;
  minPrice?: number;
  maxPrice?: number;
  minQualityScore?: number;
  brands?: string[];
  retailers?: string[];
  sizes?: string[];
  colors?: string[];
}

export interface ScrapingResult {
  success: boolean;
  products?: Product[];
  error?: string;
}

export interface RetailerSelectors {
  products: string;
  title: string;
  price: string;
  rating: string;
  reviewCount: string;
  image: string;
  link: string;
}

export interface RetailerConfig {
  url: string;
  searchPath: string;
  selectors: Partial<RetailerSelectors>;
}

export interface RetailerConfigs {
  [key: string]: RetailerConfig;
} 