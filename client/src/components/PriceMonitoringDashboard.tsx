import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PriceData {
  timestamp: string;
  price: number;
  retailer: string;
  isOnSale: boolean;
  originalPrice?: number;
}

interface ProductMonitor {
  id: string;
  productId: string;
  title: string;
  brand: string;
  imageUrl: string;
  currentPrice: number;
  targetPrice: number;
  priceHistory: PriceData[];
  status: 'active' | 'paused' | 'triggered';
  lastChecked: string;
  retailer: string;
  alertEnabled: boolean;
}

interface PriceMonitoringDashboardProps {
  monitors: ProductMonitor[];
  onUpdateMonitor: (monitorId: string, updates: Partial<ProductMonitor>) => void;
  onDeleteMonitor: (monitorId: string) => void;
  onAddMonitor: (productId: string, targetPrice: number) => void;
}

export function PriceMonitoringDashboard({
  monitors,
  onUpdateMonitor,
  onDeleteMonitor,
  onAddMonitor
}: PriceMonitoringDashboardProps) {
  const [selectedMonitor, setSelectedMonitor] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'triggered'>('all');

  const filteredMonitors = monitors.filter(monitor => {
    if (filterStatus === 'all') return true;
    return monitor.status === filterStatus;
  });

  const getPriceChange = (monitor: ProductMonitor) => {
    if (monitor.priceHistory.length < 2) return 0;
    const firstPrice = monitor.priceHistory[0].price;
    const lastPrice = monitor.priceHistory[monitor.priceHistory.length - 1].price;
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  };

  const getPriceChangeColor = (change: number) => {
    if (change < 0) return 'text-green-600';
    if (change > 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'triggered': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Price Monitoring Dashboard</h2>
          <p className="text-gray-600 mt-1">Track {monitors.length} products for price changes</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="triggered">Triggered</option>
          </select>
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            {viewMode === 'list' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Active</p>
              <p className="text-2xl font-bold text-green-900">
                {monitors.filter(m => m.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">Paused</p>
              <p className="text-2xl font-bold text-yellow-900">
                {monitors.filter(m => m.status === 'paused').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Triggered</p>
              <p className="text-2xl font-bold text-red-900">
                {monitors.filter(m => m.status === 'triggered').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V4a1 1 0 00-1-1H5a1 1 0 00-1 1v1zm0 6h6V9H4v2zm0 6h6v-2H4v2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total</p>
              <p className="text-2xl font-bold text-blue-900">{monitors.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monitors List/Grid */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredMonitors.map((monitor) => (
            <div
              key={monitor.id}
              className={`border rounded-lg p-4 transition-all ${
                selectedMonitor === monitor.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={monitor.imageUrl}
                    alt={monitor.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{monitor.title}</h3>
                    <p className="text-sm text-gray-600">{monitor.brand}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(monitor.currentPrice)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Target: {formatPrice(monitor.targetPrice)}
                      </span>
                      <span className={`text-sm font-medium ${getPriceChangeColor(getPriceChange(monitor))}`}>
                        {getPriceChange(monitor).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(monitor.status)}`}>
                    {monitor.status}
                  </span>
                  <button
                    onClick={() => setSelectedMonitor(selectedMonitor === monitor.id ? null : monitor.id)}
                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {selectedMonitor === monitor.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Price History</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={monitor.priceHistory}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="timestamp"
                            tickFormatter={(value) => formatDate(value)}
                            fontSize={12}
                          />
                          <YAxis fontSize={12} />
                          <Tooltip
                            labelFormatter={(value) => formatDate(value as string)}
                            formatter={(value: number) => [formatPrice(value), 'Price']}
                          />
                          <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Monitor Settings</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Target Price
                          </label>
                          <input
                            type="number"
                            value={monitor.targetPrice}
                            onChange={(e) => onUpdateMonitor(monitor.id, { targetPrice: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <select
                            value={monitor.status}
                            onChange={(e) => onUpdateMonitor(monitor.id, { status: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="triggered">Triggered</option>
                          </select>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={monitor.alertEnabled}
                            onChange={(e) => onUpdateMonitor(monitor.id, { alertEnabled: e.target.checked })}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label className="ml-2 text-sm text-gray-700">Enable alerts</label>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onDeleteMonitor(monitor.id)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Delete Monitor
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMonitors.map((monitor) => (
            <div
              key={monitor.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(monitor.status)}`}>
                  {monitor.status}
                </span>
                <button
                  onClick={() => onDeleteMonitor(monitor.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <img
                src={monitor.imageUrl}
                alt={monitor.title}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{monitor.title}</h3>
              <p className="text-xs text-gray-600 mb-2">{monitor.brand}</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current:</span>
                  <span className="text-lg font-bold text-green-600">{formatPrice(monitor.currentPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Target:</span>
                  <span className="text-sm font-medium">{formatPrice(monitor.targetPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Change:</span>
                  <span className={`text-sm font-medium ${getPriceChangeColor(getPriceChange(monitor))}`}>
                    {getPriceChange(monitor).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredMonitors.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium">No monitors found</p>
          <p className="text-sm">Start monitoring products to see them here</p>
        </div>
      )}
    </div>
  );
} 