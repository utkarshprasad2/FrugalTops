import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

interface ProductCardProps {
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  productUrl: string;
  rating?: number;
  reviewCount?: number;
  retailer: string;
  qualityScore?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  brand,
  price,
  originalPrice,
  imageUrl,
  productUrl,
  rating,
  reviewCount,
  retailer,
  qualityScore,
}) => {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <a href={productUrl} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative aspect-w-1 aspect-h-1">
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-64"
          />
          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md">
              {discount}% OFF
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="text-sm text-gray-500 mb-1">{brand}</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">${price.toFixed(2)}</span>
              {originalPrice && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">{retailer}</span>
          </div>
          {rating && (
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              {reviewCount && (
                <span className="ml-2 text-sm text-gray-500">
                  ({reviewCount} reviews)
                </span>
              )}
            </div>
          )}
          {qualityScore && (
            <div className="mt-2 text-sm">
              <span className="font-medium">Quality Score: </span>
              <span className={`font-bold ${
                qualityScore >= 8 ? 'text-green-600' :
                qualityScore >= 6 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {qualityScore.toFixed(1)}/10
              </span>
            </div>
          )}
        </div>
      </a>
    </div>
  );
};

export default ProductCard; 