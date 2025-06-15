import React from 'react';
import { SearchFilters } from '../services/api';

interface FiltersProps {
  filters: {
    brands: string[];
    retailers: string[];
    priceRange: {
      minPrice: number;
      maxPrice: number;
    };
  };
  selectedFilters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

const Filters: React.FC<FiltersProps> = ({
  filters,
  selectedFilters,
  onFilterChange,
}) => {
  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    onFilterChange({
      ...selectedFilters,
      [type === 'min' ? 'minPrice' : 'maxPrice']: numValue,
    });
  };

  const handleQualityScoreChange = (value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    onFilterChange({
      ...selectedFilters,
      minQualityScore: numValue,
    });
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const brands = selectedFilters.brands || [];
    onFilterChange({
      ...selectedFilters,
      brands: checked
        ? [...brands, brand]
        : brands.filter((b) => b !== brand),
    });
  };

  const handleRetailerChange = (retailer: string, checked: boolean) => {
    const retailers = selectedFilters.retailers || [];
    onFilterChange({
      ...selectedFilters,
      retailers: checked
        ? [...retailers, retailer]
        : retailers.filter((r) => r !== retailer),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Price Range</h3>
        <div className="mt-2 flex items-center space-x-4">
          <input
            type="number"
            value={selectedFilters.minPrice || ''}
            onChange={(e) => handlePriceChange('min', e.target.value)}
            placeholder="Min"
            className="w-24 px-3 py-2 border border-gray-300 rounded-md"
          />
          <span>to</span>
          <input
            type="number"
            value={selectedFilters.maxPrice || ''}
            onChange={(e) => handlePriceChange('max', e.target.value)}
            placeholder="Max"
            className="w-24 px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Quality Score</h3>
        <div className="mt-2">
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={selectedFilters.minQualityScore || ''}
            onChange={(e) => handleQualityScoreChange(e.target.value)}
            placeholder="Minimum score"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Brands</h3>
        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
          {filters.brands.map((brand) => (
            <label key={brand} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedFilters.brands?.includes(brand) || false}
                onChange={(e) => handleBrandChange(brand, e.target.checked)}
                className="h-4 w-4 text-primary-600 rounded border-gray-300"
              />
              <span className="ml-2 text-gray-700">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Retailers</h3>
        <div className="mt-2 space-y-2">
          {filters.retailers.map((retailer) => (
            <label key={retailer} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedFilters.retailers?.includes(retailer) || false}
                onChange={(e) => handleRetailerChange(retailer, e.target.checked)}
                className="h-4 w-4 text-primary-600 rounded border-gray-300"
              />
              <span className="ml-2 text-gray-700">{retailer}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Filters; 