import React, { useState, useEffect } from 'react';

interface FilterOptions {
  priceRange: {
    min: number;
    max: number;
  };
  brands: string[];
  retailers: string[];
  minRating: number;
  minQualityScore: number;
  sortBy: 'price' | 'rating' | 'qualityScore' | 'bestValue';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedFiltersProps {
  products: any[];
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

export function AdvancedFilters({ products, onFiltersChange, onClearFilters }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: { min: 0, max: 1000 },
    brands: [],
    retailers: [],
    minRating: 0,
    minQualityScore: 0,
    sortBy: 'bestValue',
    sortOrder: 'desc'
  });

  // Extract unique brands and retailers from products
  const availableBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
  const availableRetailers = Array.from(new Set(products.map(p => p.retailer).filter(Boolean)));

  // Get price range from products
  const priceRange = products.length > 0 ? {
    min: Math.min(...products.map(p => p.price)),
    max: Math.max(...products.map(p => p.price))
  } : { min: 0, max: 1000 };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: number) => {
    const newPriceRange = { ...filters.priceRange, [type]: value };
    const newFilters = { ...filters, priceRange: newPriceRange };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    handleFilterChange('brands', newBrands);
  };

  const handleRetailerToggle = (retailer: string) => {
    const newRetailers = filters.retailers.includes(retailer)
      ? filters.retailers.filter(r => r !== retailer)
      : [...filters.retailers, retailer];
    handleFilterChange('retailers', newRetailers);
  };

  const clearAllFilters = () => {
    const defaultFilters: FilterOptions = {
      priceRange: { min: 0, max: 1000 },
      brands: [],
      retailers: [],
      minRating: 0,
      minQualityScore: 0,
      sortBy: 'bestValue',
      sortOrder: 'desc'
    };
    setFilters(defaultFilters);
    onClearFilters();
  };

  const hasActiveFilters = () => {
    return filters.brands.length > 0 ||
           filters.retailers.length > 0 ||
           filters.minRating > 0 ||
           filters.minQualityScore > 0 ||
           filters.priceRange.min > priceRange.min ||
           filters.priceRange.max < priceRange.max;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-lg font-semibold text-gray-800 hover:text-indigo-600 transition-colors"
        >
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>Advanced Filters</span>
          {hasActiveFilters() && (
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </button>
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {isOpen && (
        <div className="space-y-6">
          {/* Price Range */}
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3">Price Range</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Min Price</label>
                <input
                  type="number"
                  min={priceRange.min}
                  max={filters.priceRange.max}
                  value={filters.priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Max Price</label>
                <input
                  type="number"
                  min={filters.priceRange.min}
                  max={priceRange.max}
                  value={filters.priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Range: ${priceRange.min.toFixed(2)} - ${priceRange.max.toFixed(2)}
            </div>
          </div>

          {/* Brands */}
          {availableBrands.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Brands</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableBrands.map((brand) => (
                  <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Retailers */}
          {availableRetailers.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Retailers</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableRetailers.map((retailer) => (
                  <label key={retailer} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.retailers.includes(retailer)}
                      onChange={() => handleRetailerToggle(retailer)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{retailer}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Rating and Quality Score */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Minimum Rating</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                  {filters.minRating}★
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Minimum Quality Score</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={filters.minQualityScore}
                  onChange={(e) => handleFilterChange('minQualityScore', Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                  {filters.minQualityScore}/10
                </span>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3">Sort By</h3>
            <div className="flex items-center space-x-4">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="bestValue">Best Value</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
                <option value="qualityScore">Quality Score</option>
              </select>
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters() && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
              <div className="flex flex-wrap gap-2">
                {filters.brands.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                    {filters.brands.length} brand{filters.brands.length > 1 ? 's' : ''}
                  </span>
                )}
                {filters.retailers.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                    {filters.retailers.length} retailer{filters.retailers.length > 1 ? 's' : ''}
                  </span>
                )}
                {filters.minRating > 0 && (
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                    {filters.minRating}★+ rating
                  </span>
                )}
                {filters.minQualityScore > 0 && (
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                    {filters.minQualityScore}+ quality
                  </span>
                )}
                {(filters.priceRange.min > priceRange.min || filters.priceRange.max < priceRange.max) && (
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                    ${filters.priceRange.min} - ${filters.priceRange.max}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 