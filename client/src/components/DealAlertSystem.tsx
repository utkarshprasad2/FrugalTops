import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface DealAlert {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  currentPrice: number;
  targetPrice: number;
  retailer: string;
  alertType: 'price_drop' | 'new_deal' | 'back_in_stock' | 'flash_sale';
  status: 'active' | 'triggered' | 'expired';
  createdAt: Date;
  triggeredAt?: Date;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

interface DealAlertSystemProps {
  userId?: string;
}

const DealAlertSystem: React.FC<DealAlertSystemProps> = ({ userId }) => {
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState<'price_drop' | 'new_deal' | 'back_in_stock' | 'flash_sale'>('price_drop');
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    push: true,
    sms: false,
  });

  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['dealAlerts', userId],
    queryFn: async (): Promise<DealAlert[]> => {
      const response = await axios.get(`http://localhost:3001/api/deal-alerts?userId=${userId}`);
      return response.data.alerts || [];
    },
    enabled: !!userId,
  });

  const { data: recentDeals = [] } = useQuery({
    queryKey: ['recentDeals'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3001/api/products/recent-deals');
      return response.data.deals || [];
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: async (alertData: Partial<DealAlert>) => {
      const response = await axios.post('http://localhost:3001/api/deal-alerts', alertData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealAlerts'] });
      setShowCreateAlert(false);
      setSelectedProduct(null);
      setTargetPrice('');
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await axios.delete(`http://localhost:3001/api/deal-alerts/${alertId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealAlerts'] });
    },
  });

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'price_drop': return '📉';
      case 'new_deal': return '🆕';
      case 'back_in_stock': return '📦';
      case 'flash_sale': return '⚡';
      default: return '🔔';
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'price_drop': return 'bg-red-50 text-red-700 border-red-200';
      case 'new_deal': return 'bg-green-50 text-green-700 border-green-200';
      case 'back_in_stock': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'flash_sale': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'triggered': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateAlert = () => {
    if (!selectedProduct || !targetPrice) return;

    createAlertMutation.mutate({
      productId: selectedProduct.id,
      productTitle: selectedProduct.title,
      productImage: selectedProduct.imageUrl,
      currentPrice: selectedProduct.price,
      targetPrice: parseFloat(targetPrice),
      retailer: selectedProduct.retailer,
      alertType,
      notificationPreferences: notificationPrefs,
      userId,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Deal Alerts</h2>
          <p className="text-gray-600">Get notified when prices drop or new deals appear</p>
        </div>
        <button
          onClick={() => setShowCreateAlert(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          + Create Alert
        </button>
      </div>

      {/* Create Alert Modal */}
      {showCreateAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Create Deal Alert</h3>
              <button
                onClick={() => setShowCreateAlert(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Product
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                  {recentDeals.map((product: any) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedProduct?.id === product.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {product.title}
                          </p>
                          <p className="text-sm text-gray-500">{product.brand}</p>
                          <p className="text-sm font-bold text-green-600">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alert Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Type
                </label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="price_drop">Price Drop Alert</option>
                  <option value="new_deal">New Deal Alert</option>
                  <option value="back_in_stock">Back in Stock Alert</option>
                  <option value="flash_sale">Flash Sale Alert</option>
                </select>
              </div>

              {/* Target Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Notification Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Preferences
                </label>
                <div className="space-y-2">
                  {Object.entries(notificationPrefs).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setNotificationPrefs(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {key} notifications
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateAlert(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAlert}
                disabled={!selectedProduct || !targetPrice || createAlertMutation.isLoading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createAlertMutation.isLoading ? 'Creating...' : 'Create Alert'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Alerts</h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-20 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔔</div>
            <p className="text-gray-500">No active alerts yet</p>
            <p className="text-sm text-gray-400">Create your first alert to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg ${getAlertTypeColor(alert.alertType)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <img
                      src={alert.productImage}
                      alt={alert.productTitle}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getAlertTypeIcon(alert.alertType)}</span>
                        <h4 className="font-medium text-gray-800">{alert.productTitle}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                          {alert.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>Current: {formatPrice(alert.currentPrice)}</span>
                        <span>Target: {formatPrice(alert.targetPrice)}</span>
                        <span>{alert.retailer}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>Created: {formatDate(alert.createdAt)}</span>
                        {alert.triggeredAt && (
                          <span>Triggered: {formatDate(alert.triggeredAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAlertMutation.mutate(alert.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete alert"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">📊</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Active Alerts</p>
              <p className="text-xl font-bold text-gray-800">
                {alerts.filter(a => a.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">⚡</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Triggered Today</p>
              <p className="text-xl font-bold text-gray-800">
                {alerts.filter(a => 
                  a.status === 'triggered' && 
                  new Date(a.triggeredAt!).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">💰</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Avg. Savings</p>
              <p className="text-xl font-bold text-gray-800">
                ${alerts.length > 0 
                  ? (alerts.reduce((sum, a) => sum + (a.currentPrice - a.targetPrice), 0) / alerts.length).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealAlertSystem;
