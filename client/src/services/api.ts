import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  productUrl: string;
  retailer: string;
  rating?: number;
  reviewCount?: number;
  qualityScore?: number;
}

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  minQualityScore?: number;
  brands?: string[];
  retailers?: string[];
}

export interface SearchResponse {
  success: boolean;
  products: Product[];
  source: 'cache' | 'mixed';
  error?: string;
}

export interface FiltersResponse {
  success: boolean;
  filters: {
    brands: string[];
    retailers: string[];
    priceRange: {
      minPrice: number;
      maxPrice: number;
    };
  };
  error?: string;
}

const api = {
  async searchProducts(query: string, filters?: SearchFilters): Promise<SearchResponse> {
    try {
      const params = new URLSearchParams({
        query,
        ...(filters?.minPrice && { minPrice: filters.minPrice.toString() }),
        ...(filters?.maxPrice && { maxPrice: filters.maxPrice.toString() }),
        ...(filters?.minQualityScore && { minQualityScore: filters.minQualityScore.toString() }),
        ...(filters?.brands?.length && { brands: filters.brands.join(',') }),
        ...(filters?.retailers?.length && { retailers: filters.retailers.join(',') })
      });

      const response = await axios.get<SearchResponse>(`${API_URL}/products/search?${params}`);
      return response.data;
    } catch (error) {
      console.error('Search products error:', error);
      throw error;
    }
  },

  async getFilters(): Promise<FiltersResponse> {
    try {
      const response = await axios.get<FiltersResponse>(`${API_URL}/products/filters`);
      return response.data;
    } catch (error) {
      console.error('Get filters error:', error);
      throw error;
    }
  }
};

export default api; 