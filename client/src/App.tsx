import React, { useState } from 'react';
import axios from 'axios';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import ProductAnalyticsDashboard from './components/ProductAnalyticsDashboard';
import SmartBudgetTracker from './components/SmartBudgetTracker';

const queryClient = new QueryClient();

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
}

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
  savedProducts?: Product[];
}

interface UserPreferences {
  emailNotifications: boolean;
  dealAlerts: boolean;
  favoriteRetailers: string[];
  priceThreshold?: number;
  searchFilters: {
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    preferredBrands: string[];
  };
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative pb-[100%]">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium text-indigo-600">
          {product.retailer}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">{product.title}</h3>
        <p className="text-sm text-indigo-600 font-medium mb-3">{product.brand}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-green-600">${product.price.toFixed(2)}</span>
          {product.rating && (
            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
              <span className="text-yellow-400 text-lg">★</span>
              <span className="ml-1 text-sm font-medium text-gray-700">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <a
          href={product.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-300 font-medium"
        >
          View Deal
        </a>
      </div>
    </div>
  );
}

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-indigo-600">FrugalTops</h1>
          </Link>
          <div className="flex space-x-6">
            <Link
              to="/"
              className={`text-gray-600 hover:text-indigo-600 ${location.pathname === '/' ? 'text-indigo-600 font-medium' : ''}`}
            >
              Search
            </Link>
            <Link
              to="/analytics"
              className={`text-gray-600 hover:text-indigo-600 ${location.pathname === '/analytics' ? 'text-indigo-600 font-medium' : ''}`}
            >
              Analytics
            </Link>
            <Link
              to="/budget"
              className={`text-gray-600 hover:text-indigo-600 ${location.pathname === '/budget' ? 'text-indigo-600 font-medium' : ''}`}
            >
              Budget
            </Link>
            <Link
              to="/history"
              className={`text-gray-600 hover:text-indigo-600 ${location.pathname === '/history' ? 'text-indigo-600 font-medium' : ''}`}
            >
              History
            </Link>
            <Link
              to="/profile"
              className={`text-gray-600 hover:text-indigo-600 ${location.pathname === '/profile' ? 'text-indigo-600 font-medium' : ''}`}
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useLocalStorage<SearchHistoryItem[]>('searchHistory', []);

  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ['products', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const response = await axios.get(`http://localhost:3001/api/products/search?query=${encodeURIComponent(searchQuery)}`);
      return response.data.products || [];
    },
    enabled: false,
    onSettled: () => {
      setIsSearching(false);
    },
    onSuccess: (data: Product[]) => {
      // Add to search history
      const historyItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query: searchQuery,
        timestamp: new Date(),
        resultCount: data.length,
        savedProducts: data.slice(0, 3) // Save top 3 products for quick reference
      };
      setSearchHistory([historyItem, ...searchHistory].slice(0, 20)); // Keep last 20 searches
    }
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }
    setIsSearching(true);
    await refetch();
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <form onSubmit={handleSearch} className="mb-12 max-w-3xl mx-auto">
          <div className="flex gap-4 p-2 bg-white rounded-2xl shadow-lg">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for clothing items (e.g., 'mens tank top', 'womens dress')"
              className="flex-1 px-6 py-4 rounded-xl border-2 border-transparent focus:border-indigo-500 focus:outline-none text-lg"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium text-lg transition-colors duration-300"
            >
              Search
            </button>
          </div>
        </form>

        {!isSearching && !products.length && (
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to FrugalTops!</h2>
              <p className="text-gray-600 text-lg">
                Enter a search term above to discover amazing deals on clothing from top retailers.
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
            <p className="mt-6 text-lg text-gray-600">Searching for the best deals...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-red-50 rounded-xl">
            <p className="text-red-600 text-lg">Error: Failed to fetch products. Please try again.</p>
          </div>
        ) : isSearching && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : isSearching ? (
          <div className="text-center py-16 bg-yellow-50 rounded-xl">
            <p className="text-gray-700 text-lg">No products found. Try a different search term.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function HistoryPage() {
  const [searchHistory, setSearchHistory] = useLocalStorage<SearchHistoryItem[]>('searchHistory', []);
  const [selectedItem, setSelectedItem] = useState<SearchHistoryItem | null>(null);
  const navigate = useNavigate();

  const handleDeleteHistory = (id: string) => {
    setSearchHistory(searchHistory.filter(item => item.id !== id));
  };

  const handleRepeatSearch = (query: string) => {
    navigate(`/?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Search History</h2>
          {searchHistory.length > 0 && (
            <button
              onClick={() => setSearchHistory([])}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          )}
        </div>
        
        {searchHistory.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600">No search history yet. Start searching to see your history here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {searchHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{item.query}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(item.timestamp).toLocaleDateString()} • {item.resultCount} results
                      </p>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleRepeatSearch(item.query)}
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Search Again
                      </button>
                      <button
                        onClick={() => handleDeleteHistory(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {item.savedProducts && item.savedProducts.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-3">Top Results</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {item.savedProducts.map((product) => (
                          <div key={product.id} className="bg-gray-50 rounded-lg p-3">
                            <p className="font-medium text-gray-800 line-clamp-1">{product.title}</p>
                            <p className="text-green-600">${product.price.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfilePage() {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>('userPreferences', {
    emailNotifications: false,
    dealAlerts: false,
    favoriteRetailers: ['amazon', 'target'],
    searchFilters: {
      preferredBrands: []
    }
  });

  const [newBrand, setNewBrand] = useState('');

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setPreferences({ ...preferences, [key]: value });
  };

  const handleFilterChange = (key: keyof UserPreferences['searchFilters'], value: any) => {
    setPreferences({
      ...preferences,
      searchFilters: { ...preferences.searchFilters, [key]: value }
    });
  };

  const addPreferredBrand = () => {
    if (newBrand.trim() && !preferences.searchFilters.preferredBrands.includes(newBrand.trim())) {
      handleFilterChange('preferredBrands', [...preferences.searchFilters.preferredBrands, newBrand.trim()]);
      setNewBrand('');
    }
  };

  const removePreferredBrand = (brand: string) => {
    handleFilterChange(
      'preferredBrands',
      preferences.searchFilters.preferredBrands.filter(b => b !== brand)
    );
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h2>
            
            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={preferences.emailNotifications}
                      onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                    />
                    <label htmlFor="emailNotifications" className="ml-2 text-gray-700">
                      Email notifications for price drops
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="dealAlerts"
                      checked={preferences.dealAlerts}
                      onChange={(e) => handlePreferenceChange('dealAlerts', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                    />
                    <label htmlFor="dealAlerts" className="ml-2 text-gray-700">
                      Deal alerts for saved searches
                    </label>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Price Filters</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Price ($)
                    </label>
                    <input
                      type="number"
                      id="minPrice"
                      value={preferences.searchFilters.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Price ($)
                    </label>
                    <input
                      type="number"
                      id="maxPrice"
                      value={preferences.searchFilters.maxPrice || ''}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      min="0"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Preferred Brands</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      placeholder="Add a brand"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      onClick={addPreferredBrand}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {preferences.searchFilters.preferredBrands.map((brand) => (
                      <div
                        key={brand}
                        className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        <span>{brand}</span>
                        <button
                          onClick={() => removePreferredBrand(brand)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Favorite Retailers</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="amazon"
                      checked={preferences.favoriteRetailers.includes('amazon')}
                      onChange={(e) => {
                        const newRetailers = e.target.checked
                          ? [...preferences.favoriteRetailers, 'amazon']
                          : preferences.favoriteRetailers.filter(r => r !== 'amazon');
                        handlePreferenceChange('favoriteRetailers', newRetailers);
                      }}
                      className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                    />
                    <label htmlFor="amazon" className="ml-2 text-gray-700">
                      Amazon
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="target"
                      checked={preferences.favoriteRetailers.includes('target')}
                      onChange={(e) => {
                        const newRetailers = e.target.checked
                          ? [...preferences.favoriteRetailers, 'target']
                          : preferences.favoriteRetailers.filter(r => r !== 'target');
                        handlePreferenceChange('favoriteRetailers', newRetailers);
                      }}
                      className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                    />
                    <label htmlFor="target" className="ml-2 text-gray-700">
                      Target
                    </label>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/analytics" element={<ProductAnalyticsDashboard />} />
          <Route path="/budget" element={<SmartBudgetTracker />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
      <footer className="bg-white border-t mt-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-gray-600">© 2024 FrugalTops. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <App />
      </Router>
    </QueryClientProvider>
  );
}
