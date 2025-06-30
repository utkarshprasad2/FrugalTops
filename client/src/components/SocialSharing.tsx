import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  helpfulCount: number;
  createdAt: Date;
  images?: string[];
  verified: boolean;
}

interface SharedDeal {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  retailer: string;
  sharedBy: string;
  sharedByAvatar?: string;
  shareReason: string;
  shareCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  tags: string[];
}

interface SocialSharingProps {
  productId?: string;
  userId?: string;
}

const SocialSharing: React.FC<SocialSharingProps> = ({ productId, userId }) => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'shares'>('reviews');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showShareForm, setShowShareForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    content: '',
  });
  const [shareData, setShareData] = useState({
    reason: '',
    tags: [] as string[],
  });

  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async (): Promise<Review[]> => {
      const response = await axios.get(`http://localhost:3001/api/reviews?productId=${productId}`);
      return response.data.reviews || [];
    },
    enabled: !!productId,
  });

  const { data: sharedDeals = [], isLoading: sharesLoading } = useQuery({
    queryKey: ['sharedDeals', productId],
    queryFn: async (): Promise<SharedDeal[]> => {
      const response = await axios.get(`http://localhost:3001/api/social/shares?productId=${productId}`);
      return response.data.shares || [];
    },
    enabled: !!productId,
  });

  const { data: trendingShares = [] } = useQuery({
    queryKey: ['trendingShares'],
    queryFn: async (): Promise<SharedDeal[]> => {
      const response = await axios.get('http://localhost:3001/api/social/trending');
      return response.data.shares || [];
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: Partial<Review>) => {
      const response = await axios.post('http://localhost:3001/api/reviews', reviewData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setShowReviewForm(false);
      setReviewData({ rating: 5, title: '', content: '' });
    },
  });

  const shareDealMutation = useMutation({
    mutationFn: async (shareData: Partial<SharedDeal>) => {
      const response = await axios.post('http://localhost:3001/api/social/shares', shareData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedDeals'] });
      setShowShareForm(false);
      setShareData({ reason: '', tags: [] });
    },
  });

  const likeShareMutation = useMutation({
    mutationFn: async ({ shareId, action }: { shareId: string; action: 'like' | 'unlike' }) => {
      await axios.post(`http://localhost:3001/api/social/shares/${shareId}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedDeals'] });
      queryClient.invalidateQueries({ queryKey: ['trendingShares'] });
    },
  });

  const helpfulReviewMutation = useMutation({
    mutationFn: async ({ reviewId, action }: { reviewId: string; action: 'helpful' | 'unhelpful' }) => {
      await axios.post(`http://localhost:3001/api/reviews/${reviewId}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onChange?.(star)}
            className={`text-2xl ${interactive ? 'cursor-pointer' : ''} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Community</h2>
          <p className="text-gray-600">Read reviews and share deals with the community</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Write Review
          </button>
          <button
            onClick={() => setShowShareForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Share Deal
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'reviews'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Reviews ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('shares')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'shares'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Shared Deals ({sharedDeals.length})
        </button>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Write a Review</h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                {renderStars(reviewData.rating, true, (rating) =>
                  setReviewData(prev => ({ ...prev, rating }))
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={reviewData.title}
                  onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Summarize your experience"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review
                </label>
                <textarea
                  value={reviewData.content}
                  onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your detailed experience with this product..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowReviewForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => createReviewMutation.mutate({
                  ...reviewData,
                  productId,
                  userId,
                })}
                disabled={!reviewData.title || !reviewData.content || createReviewMutation.isLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createReviewMutation.isLoading ? 'Posting...' : 'Post Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Deal Modal */}
      {showShareForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Share This Deal</h3>
              <button
                onClick={() => setShowShareForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why are you sharing this deal?
                </label>
                <textarea
                  value={shareData.reason}
                  onChange={(e) => setShareData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Tell the community why this deal is worth sharing..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (optional)
                </label>
                <input
                  type="text"
                  placeholder="Add tags separated by commas (e.g., summer, casual, budget)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onBlur={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    setShareData(prev => ({ ...prev, tags }));
                  }}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowShareForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => shareDealMutation.mutate({
                  ...shareData,
                  productId,
                  userId,
                })}
                disabled={!shareData.reason || shareDealMutation.isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {shareDealMutation.isLoading ? 'Sharing...' : 'Share Deal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'reviews' ? (
        <div className="space-y-6">
          {reviewsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-32 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-500">No reviews yet</p>
              <p className="text-sm text-gray-400">Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">
                        {review.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-800">{review.userName}</h4>
                        {review.verified && (
                          <span className="text-blue-600 text-sm">✓ Verified</span>
                        )}
                        <span className="text-gray-500 text-sm">{formatDate(review.createdAt)}</span>
                      </div>
                      <div className="mb-3">
                        {renderStars(review.rating)}
                      </div>
                      <h5 className="font-medium text-gray-800 mb-2">{review.title}</h5>
                      <p className="text-gray-600 mb-4">{review.content}</p>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => helpfulReviewMutation.mutate({
                            reviewId: review.id,
                            action: 'helpful'
                          })}
                          className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
                        >
                          <span>👍</span>
                          <span>{review.helpfulCount} helpful</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {sharesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-40 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : sharedDeals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🤝</div>
              <p className="text-gray-500">No shared deals yet</p>
              <p className="text-sm text-gray-400">Be the first to share this deal!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sharedDeals.map((share) => (
                <div key={share.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {share.sharedBy.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-800">{share.sharedBy}</h4>
                        <span className="text-gray-500 text-sm">{formatDate(share.createdAt)}</span>
                      </div>
                      <p className="text-gray-600 mb-4">{share.shareReason}</p>
                      
                      {/* Product Card */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={share.productImage}
                            alt={share.productTitle}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-800">{share.productTitle}</h5>
                            <p className="text-green-600 font-bold">{formatPrice(share.productPrice)}</p>
                            <p className="text-sm text-gray-500">{share.retailer}</p>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      {share.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {share.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => likeShareMutation.mutate({
                            shareId: share.id,
                            action: 'like'
                          })}
                          className="flex items-center space-x-1 text-gray-500 hover:text-red-500"
                        >
                          <span>❤️</span>
                          <span>{share.likeCount}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                          <span>💬</span>
                          <span>{share.commentCount}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                          <span>📤</span>
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trending Shares */}
      {activeTab === 'shares' && trendingShares.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔥 Trending Deals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingShares.slice(0, 6).map((share) => (
              <div key={share.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-600">{share.sharedBy}</span>
                  <span className="text-xs text-gray-400">{formatDate(share.createdAt)}</span>
                </div>
                <img
                  src={share.productImage}
                  alt={share.productTitle}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="font-medium text-gray-800 text-sm mb-2 line-clamp-2">
                  {share.productTitle}
                </h4>
                <p className="text-green-600 font-bold text-sm mb-2">
                  {formatPrice(share.productPrice)}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{share.retailer}</span>
                  <span>❤️ {share.likeCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialSharing;
