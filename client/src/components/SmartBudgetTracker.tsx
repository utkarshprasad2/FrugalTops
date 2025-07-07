import React, { useState, useEffect } from 'react';

interface BudgetCategory {
  id: string;
  name: string;
  budget: number;
  spent: number;
  color: string;
  icon: string;
}

interface Purchase {
  id: string;
  productName: string;
  price: number;
  category: string;
  date: Date;
  retailer: string;
  saved: number;
}

interface BudgetInsight {
  type: 'warning' | 'success' | 'info';
  message: string;
  action?: string;
}

interface SmartBudgetTrackerProps {
  userId?: string;
}

const SmartBudgetTracker: React.FC<SmartBudgetTrackerProps> = ({ userId }) => {
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([
    { id: '1', name: 'T-Shirts & Tops', budget: 200, spent: 145, color: '#3B82F6', icon: '👕' },
    { id: '2', name: 'Jeans & Pants', budget: 300, spent: 220, color: '#10B981', icon: '👖' },
    { id: '3', name: 'Dresses', budget: 250, spent: 180, color: '#F59E0B', icon: '👗' },
    { id: '4', name: 'Shoes', budget: 400, spent: 320, color: '#EF4444', icon: '👟' },
    { id: '5', name: 'Accessories', budget: 100, spent: 75, color: '#8B5CF6', icon: '👜' },
  ]);

  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([
    { id: '1', productName: 'Nike Air Max Sneakers', price: 89.99, category: 'Shoes', date: new Date('2024-01-15'), retailer: 'Amazon', saved: 15.00 },
    { id: '2', productName: 'Levi\'s 501 Jeans', price: 45.50, category: 'Jeans & Pants', date: new Date('2024-01-14'), retailer: 'Walmart', saved: 8.50 },
    { id: '3', productName: 'Cotton T-Shirt Pack', price: 24.99, category: 'T-Shirts & Tops', date: new Date('2024-01-13'), retailer: 'Target', saved: 5.00 },
    { id: '4', productName: 'Summer Dress', price: 67.80, category: 'Dresses', date: new Date('2024-01-12'), retailer: 'Macy\'s', saved: 12.20 },
    { id: '5', productName: 'Leather Wallet', price: 35.00, category: 'Accessories', date: new Date('2024-01-11'), retailer: 'Nordstrom', saved: 10.00 },
  ]);

  const [totalBudget, setTotalBudget] = useState(1250);
  const [totalSpent, setTotalSpent] = useState(940);
  const [monthlyGoal, setMonthlyGoal] = useState(800);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', budget: 0, color: '#3B82F6' });

  const getInsights = (): BudgetInsight[] => {
    const insights: BudgetInsight[] = [];
    const remainingBudget = totalBudget - totalSpent;
    const spendingRate = totalSpent / (new Date().getDate() / 30); // Monthly rate

    if (remainingBudget < 100) {
      insights.push({
        type: 'warning',
        message: 'Budget nearly exhausted! Consider waiting for next month.',
        action: 'Review spending'
      });
    }

    if (spendingRate > monthlyGoal * 1.2) {
      insights.push({
        type: 'warning',
        message: 'Spending rate is 20% above monthly goal.',
        action: 'Adjust budget'
      });
    }

    const savings = recentPurchases.reduce((sum, purchase) => sum + purchase.saved, 0);
    if (savings > 50) {
      insights.push({
        type: 'success',
        message: `Great job! You've saved $${savings.toFixed(2)} this month.`,
        action: 'View savings'
      });
    }

    const overBudgetCategories = budgetCategories.filter(cat => cat.spent > cat.budget);
    if (overBudgetCategories.length > 0) {
      insights.push({
        type: 'warning',
        message: `${overBudgetCategories.length} category(ies) over budget.`,
        action: 'Review categories'
      });
    }

    return insights;
  };

  const getRecommendations = () => {
    const recommendations = [];
    const totalSavings = recentPurchases.reduce((sum, purchase) => sum + purchase.saved, 0);
    const avgSavings = totalSavings / recentPurchases.length;

    if (avgSavings > 10) {
      recommendations.push({
        title: 'Savings Champion',
        description: 'You\'re saving an average of $' + avgSavings.toFixed(2) + ' per purchase!',
        icon: '🏆',
        color: 'bg-green-100 text-green-800'
      });
    }

    const mostExpensiveCategory = budgetCategories.reduce((max, cat) => 
      cat.spent > max.spent ? cat : max
    );
    
    if (mostExpensiveCategory.spent > mostExpensiveCategory.budget * 0.8) {
      recommendations.push({
        title: 'Budget Alert',
        description: `${mostExpensiveCategory.name} is approaching budget limit.`,
        icon: '⚠️',
        color: 'bg-yellow-100 text-yellow-800'
      });
    }

    const bestValueRetailer = recentPurchases.reduce((best, purchase) => {
      const savings = purchase.saved / purchase.price;
      return savings > best.savings ? { retailer: purchase.retailer, savings } : best;
    }, { retailer: '', savings: 0 });

    if (bestValueRetailer.retailer) {
      recommendations.push({
        title: 'Best Value',
        description: `${bestValueRetailer.retailer} offers the best savings (${(bestValueRetailer.savings * 100).toFixed(1)}%).`,
        icon: '💰',
        color: 'bg-blue-100 text-blue-800'
      });
    }

    return recommendations;
  };

  const addCategory = () => {
    if (newCategory.name && newCategory.budget > 0) {
      const category: BudgetCategory = {
        id: Date.now().toString(),
        name: newCategory.name,
        budget: newCategory.budget,
        spent: 0,
        color: newCategory.color,
        icon: '📦'
      };
      setBudgetCategories([...budgetCategories, category]);
      setTotalBudget(totalBudget + newCategory.budget);
      setNewCategory({ name: '', budget: 0, color: '#3B82F6' });
      setShowAddCategory(false);
    }
  };

  const updateCategoryBudget = (id: string, newBudget: number) => {
    const category = budgetCategories.find(cat => cat.id === id);
    if (category) {
      const budgetDifference = newBudget - category.budget;
      setTotalBudget(totalBudget + budgetDifference);
      setBudgetCategories(budgetCategories.map(cat => 
        cat.id === id ? { ...cat, budget: newBudget } : cat
      ));
    }
  };

  const insights = getInsights();
  const recommendations = getRecommendations();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Smart Budget Tracker</h2>
          <p className="text-gray-600 mt-1">Track spending and get personalized insights</p>
        </div>
        <button
          onClick={() => setShowAddCategory(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add Category
        </button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Budget</p>
              <p className="text-2xl font-bold text-blue-800">${totalBudget.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Spent</p>
              <p className="text-2xl font-bold text-green-800">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">💳</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Remaining</p>
              <p className="text-2xl font-bold text-purple-800">${(totalBudget - totalSpent).toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-xl">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Budget Progress</span>
          <span className="text-sm text-gray-500">{((totalSpent / totalBudget) * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              totalSpent / totalBudget > 0.9 ? 'bg-red-500' : 
              totalSpent / totalBudget > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Smart Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                insight.type === 'warning' ? 'bg-red-50 border-red-200' :
                insight.type === 'success' ? 'bg-green-50 border-green-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${
                    insight.type === 'warning' ? 'text-red-700' :
                    insight.type === 'success' ? 'text-green-700' :
                    'text-blue-700'
                  }`}>
                    {insight.message}
                  </p>
                  {insight.action && (
                    <button className={`text-xs px-2 py-1 rounded ${
                      insight.type === 'warning' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                      insight.type === 'success' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                      'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    } transition-colors`}>
                      {insight.action}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Categories */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Categories</h3>
        <div className="space-y-4">
          {budgetCategories.map((category) => {
            const percentage = (category.spent / category.budget) * 100;
            const isOverBudget = category.spent > category.budget;
            
            return (
              <div key={category.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-800">{category.name}</h4>
                      <p className="text-sm text-gray-500">
                        ${category.spent.toFixed(2)} / ${category.budget.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      isOverBudget ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {percentage.toFixed(1)}%
                    </span>
                    {isOverBudget && (
                      <p className="text-xs text-red-500">Over budget!</p>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isOverBudget ? 'bg-red-500' : 
                      percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {isOverBudget ? `$${(category.spent - category.budget).toFixed(2)} over` : 
                     `$${(category.budget - category.spent).toFixed(2)} remaining`}
                  </span>
                  <button
                    onClick={() => {
                      const newBudget = prompt(`Enter new budget for ${category.name}:`, category.budget.toString());
                      if (newBudget && !isNaN(Number(newBudget))) {
                        updateCategoryBudget(category.id, Number(newBudget));
                      }
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Edit Budget
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Purchases */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Purchases</h3>
        <div className="space-y-3">
          {recentPurchases.slice(0, 5).map((purchase) => (
            <div key={purchase.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 text-sm">🛍️</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{purchase.productName}</p>
                  <p className="text-sm text-gray-500">{purchase.retailer} • {purchase.date.toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-800">${purchase.price.toFixed(2)}</p>
                <p className="text-sm text-green-600">Saved ${purchase.saved.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Personalized Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <div key={index} className={`p-4 rounded-lg ${rec.color}`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{rec.icon}</span>
                <div>
                  <h4 className="font-medium">{rec.title}</h4>
                  <p className="text-sm mt-1">{rec.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Winter Coats"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount</label>
                <input
                  type="number"
                  value={newCategory.budget}
                  onChange={(e) => setNewCategory({ ...newCategory, budget: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddCategory(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addCategory}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartBudgetTracker; 