import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  priceTrends: Array<{
    date: string;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    productCount: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  retailerPerformance: Array<{
    retailer: string;
    averagePrice: number;
    productCount: number;
    rating: number;
  }>;
  seasonalTrends: Array<{
    month: string;
    demand: number;
    averagePrice: number;
  }>;
  priceRangeDistribution: Array<{
    range: string;
    count: number;
  }>;
}

interface ProductAnalyticsDashboardProps {
  searchQuery?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const ProductAnalyticsDashboard: React.FC<ProductAnalyticsDashboardProps> = ({
  searchQuery = '',
  timeRange = '30d'
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'price' | 'demand' | 'category' | 'retailer'>('price');
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  // Mock data - in real app, this would come from API
  const mockAnalyticsData: AnalyticsData = {
    priceTrends: [
      { date: '2024-01-01', averagePrice: 45.20, minPrice: 32.10, maxPrice: 78.50, productCount: 156 },
      { date: '2024-01-08', averagePrice: 43.80, minPrice: 30.90, maxPrice: 75.20, productCount: 142 },
      { date: '2024-01-15', averagePrice: 47.10, minPrice: 35.40, maxPrice: 82.10, productCount: 168 },
      { date: '2024-01-22', averagePrice: 44.90, minPrice: 33.20, maxPrice: 79.80, productCount: 151 },
      { date: '2024-01-29', averagePrice: 42.30, minPrice: 31.50, maxPrice: 76.40, productCount: 139 },
    ],
    categoryDistribution: [
      { category: 'T-Shirts', count: 245, percentage: 35 },
      { category: 'Jeans', count: 189, percentage: 27 },
      { category: 'Dresses', count: 156, percentage: 22 },
      { category: 'Shoes', count: 89, percentage: 13 },
      { category: 'Accessories', count: 23, percentage: 3 },
    ],
    retailerPerformance: [
      { retailer: 'Amazon', averagePrice: 38.50, productCount: 234, rating: 4.2 },
      { retailer: 'Walmart', averagePrice: 32.80, productCount: 189, rating: 3.9 },
      { retailer: 'Target', averagePrice: 41.20, productCount: 156, rating: 4.1 },
      { retailer: 'Nordstrom', averagePrice: 67.40, productCount: 89, rating: 4.5 },
      { retailer: 'Macy\'s', averagePrice: 58.90, productCount: 123, rating: 4.0 },
    ],
    seasonalTrends: [
      { month: 'Jan', demand: 85, averagePrice: 44.20 },
      { month: 'Feb', demand: 78, averagePrice: 42.80 },
      { month: 'Mar', demand: 92, averagePrice: 46.10 },
      { month: 'Apr', demand: 105, averagePrice: 48.50 },
      { month: 'May', demand: 118, averagePrice: 51.20 },
      { month: 'Jun', demand: 125, averagePrice: 53.80 },
    ],
    priceRangeDistribution: [
      { range: '$0-25', count: 156 },
      { range: '$25-50', count: 234 },
      { range: '$50-75', count: 189 },
      { range: '$75-100', count: 98 },
      { range: '$100+', count: 67 },
    ],
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(mockAnalyticsData);
      setIsLoading(false);
    };

    fetchAnalytics();
  }, [searchQuery, selectedTimeRange]);

  const getInsights = () => {
    if (!analyticsData) return [];
    
    const insights = [];
    
    // Price trend insight
    const latestPrice = analyticsData.priceTrends[analyticsData.priceTrends.length - 1]?.averagePrice;
    const previousPrice = analyticsData.priceTrends[analyticsData.priceTrends.length - 2]?.averagePrice;
    if (latestPrice && previousPrice) {
      const change = ((latestPrice - previousPrice) / previousPrice) * 100;
      insights.push({
        type: 'price',
        message: `Average price ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}%`,
        trend: change > 0 ? 'up' : 'down',
        value: Math.abs(change).toFixed(1) + '%'
      });
    }

    // Best value retailer
    const bestValue = analyticsData.retailerPerformance.reduce((min, retailer) => 
      retailer.averagePrice < min.averagePrice ? retailer : min
    );
    insights.push({
      type: 'retailer',
      message: `${bestValue.retailer} offers the best average prices`,
      trend: 'value',
      value: `$${bestValue.averagePrice.toFixed(2)}`
    });

    // Most popular category
    const mostPopular = analyticsData.categoryDistribution[0];
    insights.push({
      type: 'category',
      message: `${mostPopular.category} is the most popular category`,
      trend: 'popular',
      value: `${mostPopular.percentage}%`
    });

    return insights;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Product Analytics</h2>
          {searchQuery && (
            <p className="text-gray-600 mt-1">Analysis for "{searchQuery}"</p>
          )}
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {getInsights().map((insight, index) => (
          <div key={index} className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{insight.message}</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{insight.value}</p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                insight.trend === 'up' ? 'bg-green-100 text-green-600' :
                insight.trend === 'down' ? 'bg-red-100 text-red-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {insight.trend === 'up' ? '↗' : insight.trend === 'down' ? '↘' : '→'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Navigation */}
      <div className="flex space-x-2 mb-6">
        {[
          { key: 'price', label: 'Price Trends' },
          { key: 'demand', label: 'Seasonal Demand' },
          { key: 'category', label: 'Category Distribution' },
          { key: 'retailer', label: 'Retailer Performance' }
        ].map((metric) => (
          <button
            key={metric.key}
            onClick={() => setSelectedMetric(metric.key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedMetric === metric.key
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="space-y-8">
        {selectedMetric === 'price' && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Price Trends Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.priceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="averagePrice" stroke="#8884d8" strokeWidth={2} name="Average Price" />
                <Line type="monotone" dataKey="minPrice" stroke="#82ca9d" strokeWidth={2} name="Min Price" />
                <Line type="monotone" dataKey="maxPrice" stroke="#ffc658" strokeWidth={2} name="Max Price" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedMetric === 'demand' && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Seasonal Demand & Pricing</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.seasonalTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="demand" fill="#8884d8" name="Demand Index" />
                <Bar yAxisId="right" dataKey="averagePrice" fill="#82ca9d" name="Avg Price ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedMetric === 'category' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Price Range Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.priceRangeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedMetric === 'retailer' && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Retailer Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.retailerPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="retailer" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="averagePrice" fill="#8884d8" name="Avg Price ($)" />
                <Bar dataKey="rating" fill="#82ca9d" name="Rating" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Smart Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-800 mb-2">Best Time to Buy</h4>
            <p className="text-sm text-gray-600">Based on price trends, consider waiting 1-2 weeks for potential price drops.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-800 mb-2">Top Value Retailer</h4>
            <p className="text-sm text-gray-600">Walmart offers the best average prices with good product selection.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-800 mb-2">Category Insight</h4>
            <p className="text-sm text-gray-600">T-Shirts have the highest availability and competitive pricing.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-800 mb-2">Price Range</h4>
            <p className="text-sm text-gray-600">Most products fall in the $25-50 range, offering good value.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAnalyticsDashboard; 