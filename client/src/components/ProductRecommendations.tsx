import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  retailer: string;
  rating?: number;
  reviewCount?: number;
  qualityScore?: number;
  category?: string;
  tags?: string[];
}

interface RecommendationReason {
  type: 'similar_search' | 'brand_preference' | 'price_range' | 'category_interest' | 'trending';
  description: string;
  confidence: number;
}

interface RecommendedProduct extends Product {
  reason: RecommendationReason;
  matchScore: number;
}

interface ProductRecommendationsProps {
  userId?: string;
  currentProduct?: Product;
  userPreferences?: {
    favoriteBrands: string[];
    priceRange: { min: number; max: number };
    preferredCategories: string[];
  };
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  userId,
  currentProduct,
  userPreferences
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'price' | 'rating' | 'newest'>('relevance');

  const { data: recommendations = [], isLoading, error } = useQuery({
    queryKey: ['recommendations', userId, currentProduct?.id, selectedCategory, sortBy],
    queryFn: async (): Promise<RecommendedProduct[]> => {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (currentProduct?.id) params.append('currentProductId', currentProduct.id);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      params.append('sortBy', sortBy);
      
      const response = await axios.get(`http://localhost:3001/api/recommendations?${params}`);
      return response.data.recommendations || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'shirts', name: 'Shirts & Tops' },
    { id: 'pants', name: 'Pants & Jeans' },
    { id: 'dresses', name: 'Dresses' },
    { id: 'outerwear', name: 'Outerwear' },
    { id: 'shoes', name: 'Shoes' },
    { id: 'accessories', name: 'Accessories' },
  ];

  const getReasonIcon = (type: string) => {
    switch (type) {
      case 'similar_search': return '🔍';
      case 'brand_preference': return '⭐';
      case 'price_range': return '💰';
      case 'category_interest': return '📂';
      case 'trending': return '🔥';
      default: return '💡';
    }
  };

  const getReasonColor = (type: string) => {
    switch (type) {
      case 'similar_search': return 'bg-blue-50 text-blue-700';
      case 'brand_preference': return 'bg-yellow-50 text-yellow-700';
      case 'price_range': return 'bg-green-50 text-green-700';
      case 'category_interest': return 'bg-purple-50 text-purple-700';
      case 'trending': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Recommended for You</h2>
          <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recommended for You</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">Unable to load recommendations at this time.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Recommended for You</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="relevance">Most Relevant</option>
            <option value="price">Lowest Price</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤔</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No recommendations yet</h3>
          <p className="text-gray-500 mb-4">
            Start searching for products to get personalized recommendations!
          </p>
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-indigo-600">
                  {product.retailer}
                </div>
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReasonColor(product.reason.type)}`}>
                    {getReasonIcon(product.reason.type)} {product.reason.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-green-600">
                  {product.matchScore}% match
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.title}</h3>
                <p className="text-sm text-indigo-600 font-medium mb-2">{product.brand}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-green-600">${product.price.toFixed(2)}</span>
                  {product.rating && (
                    <div className="flex items-center">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="ml-1 text-sm text-gray-600">{product.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mb-3 italic">
                  "{product.reason.description}"
                </p>

                <div className="flex space-x-2">
                  <a
                    href={product.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    View Deal
                  </a>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-gray-600">❤️</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Load More Recommendations
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductRecommendations; 