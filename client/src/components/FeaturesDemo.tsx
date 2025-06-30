import React, { useState } from 'react';
import ProductRecommendations from './ProductRecommendations';
import DealAlertSystem from './DealAlertSystem';
import SocialSharing from './SocialSharing';

const FeaturesDemo: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<'recommendations' | 'alerts' | 'social'>('recommendations');

  const features = [
    {
      id: 'recommendations',
      name: 'AI Recommendations',
      description: 'Smart product suggestions based on your preferences',
      icon: '🤖'
    },
    {
      id: 'alerts',
      name: 'Deal Alerts',
      description: 'Get notified when prices drop or new deals appear',
      icon: '🔔'
    },
    {
      id: 'social',
      name: 'Social Sharing',
      description: 'Share deals and read reviews from the community',
      icon: '🤝'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">New Features Demo</h1>
          <p className="text-gray-600">Explore the latest features added to FrugalTops</p>
        </div>
      </div>

      {/* Feature Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id as any)}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeFeature === feature.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{feature.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold">{feature.name}</div>
                    <div className="text-xs text-gray-400">{feature.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeFeature === 'recommendations' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">AI-Powered Recommendations</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our smart recommendation engine analyzes your search history, preferences, and behavior 
                to suggest products you'll love. Get personalized recommendations based on your style, 
                budget, and shopping patterns.
              </p>
            </div>
            <ProductRecommendations userId="demo-user" />
          </div>
        )}

        {activeFeature === 'alerts' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Smart Deal Alerts</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Never miss a great deal again! Set up price alerts for your favorite items and get 
                instant notifications when prices drop. Track your savings and manage all your alerts 
                in one place.
              </p>
            </div>
            <DealAlertSystem userId="demo-user" />
          </div>
        )}

        {activeFeature === 'social' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Community & Social Features</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Join the FrugalTops community! Share amazing deals you find, read and write reviews, 
                and discover trending products. Connect with other savvy shoppers and build your 
                shopping network.
              </p>
            </div>
            <SocialSharing productId="demo-product" userId="demo-user" />
          </div>
        )}
      </div>

      {/* Feature Benefits */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h3 className="text-xl font-bold text-gray-800 mb-8 text-center">Why These Features Matter</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h4 className="font-semibold text-gray-800 mb-2">Save More Money</h4>
              <p className="text-gray-600">
                Smart alerts and recommendations help you find the best deals and avoid missing out on price drops.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⏰</div>
              <h4 className="font-semibold text-gray-800 mb-2">Save Time</h4>
              <p className="text-gray-600">
                AI recommendations surface relevant products quickly, so you spend less time searching and more time shopping.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h4 className="font-semibold text-gray-800 mb-2">Community Driven</h4>
              <p className="text-gray-600">
                Share and discover deals with other shoppers, read authentic reviews, and make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesDemo; 