import React, { useEffect, useState } from 'react';

interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  retailer: string;
}

export function RecentlyViewedCarousel() {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('frugaltops-recently-viewed');
    if (saved) {
      try {
        setRecentlyViewed(JSON.parse(saved));
      } catch (e) {
        setRecentlyViewed([]);
      }
    }
  }, []);

  if (recentlyViewed.length === 0) return null;

  return (
    <div className="my-8">
      <h2 className="text-lg font-semibold mb-2">Recently Viewed</h2>
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {recentlyViewed.map((product) => (
          <a
            key={product.id}
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-[180px] max-w-[180px] bg-white rounded-lg shadow hover:shadow-lg transition-shadow flex-shrink-0"
          >
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-28 object-cover rounded-t-lg"
            />
            <div className="p-3">
              <div className="text-xs text-gray-500 mb-1">{product.brand}</div>
              <div className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">{product.title}</div>
              <div className="text-green-600 font-bold">${product.price.toFixed(2)}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
} 