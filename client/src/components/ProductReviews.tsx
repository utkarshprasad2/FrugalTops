import React, { useState } from 'react';

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

interface ProductReviewsProps {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

export function ProductReviews({ reviews, averageRating, reviewCount }: ProductReviewsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        className="flex items-center space-x-2 text-yellow-600 hover:underline"
        onClick={() => setIsOpen(true)}
      >
        <span className="font-bold">{averageRating.toFixed(1)}★</span>
        <span className="text-sm text-gray-600">({reviewCount} reviews)</span>
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold mb-2">Product Reviews</h2>
            <div className="mb-4">
              <span className="font-bold text-yellow-600 text-xl">{averageRating.toFixed(1)}★</span>
              <span className="ml-2 text-gray-600">({reviewCount} reviews)</span>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-4">
              {reviews.length === 0 ? (
                <div className="text-gray-500 text-center">No reviews yet.</div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border-b pb-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-yellow-600">{review.rating}★</span>
                      <span className="text-xs text-gray-500">by {review.author}</span>
                      <span className="text-xs text-gray-400 ml-auto">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm text-gray-700">{review.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 