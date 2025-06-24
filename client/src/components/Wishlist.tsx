import React, { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface WishlistItem {
  id: string;
  productId: string;
  title: string;
  brand: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  retailer: string;
  addedAt: Date;
  category: string;
  notes?: string;
  targetPrice?: number;
  isOnSale: boolean;
  originalPrice?: number;
}

interface WishlistProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Wishlist({ isOpen, onClose }: WishlistProps) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');

  // Load wishlist from localStorage
  useEffect(() => {
    const savedWishlist = localStorage.getItem('frugaltops-wishlist');
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        setWishlistItems(parsedWishlist.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        })));
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
      }
    }
  }, []);

  // Save wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('frugaltops-wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (product: any, category: string = 'General', notes?: string) => {
    const existingItem = wishlistItems.find(item => item.productId === product.id);
    if (existingItem) {
      return false; // Already in wishlist
    }

    const newItem: WishlistItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      title: product.title,
      brand: product.brand,
      price: product.price,
      imageUrl: product.imageUrl,
      productUrl: product.productUrl,
      retailer: product.retailer,
      addedAt: new Date(),
      category,
      notes,
      isOnSale: false,
      originalPrice: product.price
    };

    setWishlistItems(prev => [...prev, newItem]);
    return true;
  };

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateWishlistItem = (itemId: string, updates: Partial<WishlistItem>) => {
    setWishlistItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  };

  const getCategories = () => {
    const categories = Array.from(new Set(wishlistItems.map(item => item.category)));
    return ['all', ...categories];
  };

  const getFilteredAndSortedItems = () => {
    let filtered = wishlistItems;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Sort items
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = a.addedAt.getTime() - b.addedAt.getTime();
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const getPriceChange = (item: WishlistItem) => {
    if (!item.originalPrice) return 0;
    return ((item.price - item.originalPrice) / item.originalPrice) * 100;
  };

  const getPriceChangeColor = (change: number) => {
    if (change < 0) return 'text-green-600';
    if (change > 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredItems = getFilteredAndSortedItems();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Wishlist Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Wishlist ({wishlistItems.length})
              </h2>
              <p className="text-sm text-gray-600">Save products for later</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filters and Controls */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-4">
              {/* Category Filter */}
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {getCategories().map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div className="flex gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="date">Date Added</option>
                    <option value="price">Price</option>
                    <option value="name">Name</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Wishlist Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-lg font-medium text-gray-500">
                  {selectedCategory === 'all' ? 'Your wishlist is empty' : `No items in ${selectedCategory}`}
                </p>
                <p className="text-sm text-gray-400">Add products to your wishlist to see them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                        {item.category}
                      </span>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />

                    <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-gray-600 mb-2">{item.brand}</p>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current:</span>
                        <span className="text-lg font-bold text-green-600">{formatPrice(item.price)}</span>
                      </div>
                      {item.originalPrice && item.originalPrice !== item.price && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Original:</span>
                          <span className="text-sm line-through text-gray-500">{formatPrice(item.originalPrice)}</span>
                        </div>
                      )}
                      {item.targetPrice && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Target:</span>
                          <span className="text-sm font-medium text-blue-600">{formatPrice(item.targetPrice)}</span>
                        </div>
                      )}
                      {item.originalPrice && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Change:</span>
                          <span className={`text-sm font-medium ${getPriceChangeColor(getPriceChange(item))}`}>
                            {getPriceChange(item).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {item.notes && (
                      <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        <strong>Notes:</strong> {item.notes}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{item.retailer}</span>
                      <span>Added {formatDate(item.addedAt)}</span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                        className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <a
                        href={item.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm text-center"
                      >
                        View Deal
                      </a>
                    </div>

                    {/* Edit Form */}
                    {editingItem === item.id && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                            <input
                              type="text"
                              value={item.category}
                              onChange={(e) => updateWishlistItem(item.id, { category: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Target Price</label>
                            <input
                              type="number"
                              value={item.targetPrice || ''}
                              onChange={(e) => updateWishlistItem(item.id, { targetPrice: parseFloat(e.target.value) || undefined })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="Optional"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                              value={item.notes || ''}
                              onChange={(e) => updateWishlistItem(item.id, { notes: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                              rows={2}
                              placeholder="Add notes..."
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 