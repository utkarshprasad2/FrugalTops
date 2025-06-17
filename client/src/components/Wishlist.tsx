import React from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface WishlistProps {
  items: Product[];
  onRemoveFromWishlist: (id: number) => void;
  onAddToCart: (product: Product) => void;
}

export const Wishlist: React.FC<WishlistProps> = ({
  items,
  onRemoveFromWishlist,
  onAddToCart,
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No items in wishlist</h3>
        <p className="mt-1 text-sm text-gray-500">Start adding items to your wishlist!</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Your Wishlist</h2>
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-center object-cover"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">{item.name}</h3>
                  <p className="mt-1 text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onAddToCart(item)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => onRemoveFromWishlist(item.id)}
                    className="text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    <HeartSolidIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 