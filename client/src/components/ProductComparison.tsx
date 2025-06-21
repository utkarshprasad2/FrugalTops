import React, { useState } from 'react';

interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  retailer: string;
  rating?: number;
  reviewCount?: number;
  qualityScore?: number;
}

interface ProductComparisonProps {
  products: Product[];
  onRemoveProduct: (productId: string) => void;
}

export function ProductComparison({ products, onRemoveProduct }: ProductComparisonProps) {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const addToComparison = (product: Product) => {
    if (selectedProducts.length < 4 && !selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const removeFromComparison = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const getBestValue = () => {
    if (selectedProducts.length === 0) return null;
    return selectedProducts.reduce((best, current) => {
      const currentValue = current.qualityScore ? current.qualityScore / current.price : 0;
      const bestValue = best.qualityScore ? best.qualityScore / best.price : 0;
      return currentValue > bestValue ? current : best;
    });
  };

  const bestValue = getBestValue();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Product Comparison</h2>
        <span className="text-sm text-gray-500">
          {selectedProducts.length}/4 products selected
        </span>
      </div>

      {/* Available Products */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Available Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedProducts.find(p => p.id === product.id)
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
              onClick={() => addToComparison(product)}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 truncate">{product.title}</h4>
                  <p className="text-sm text-gray-600">{product.brand}</p>
                  <p className="text-lg font-bold text-green-600">${product.price.toFixed(2)}</p>
                </div>
                {selectedProducts.find(p => p.id === product.id) && (
                  <div className="text-indigo-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {selectedProducts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-700">Features</th>
                {selectedProducts.map((product) => (
                  <th key={product.id} className="text-center p-4 font-semibold text-gray-700">
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => removeFromComparison(product.id)}
                        className="ml-auto text-gray-400 hover:text-red-500 mb-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-20 h-20 object-cover rounded-lg mb-2"
                      />
                      <h4 className="font-medium text-sm text-gray-800 mb-1">{product.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{product.brand}</p>
                      {bestValue?.id === product.id && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
                          Best Value
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="p-4 font-medium text-gray-700">Price</td>
                {selectedProducts.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <span className="text-xl font-bold text-green-600">${product.price.toFixed(2)}</span>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-4 font-medium text-gray-700">Retailer</td>
                {selectedProducts.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <span className="text-sm text-gray-600">{product.retailer}</span>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-4 font-medium text-gray-700">Rating</td>
                {selectedProducts.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    {product.rating ? (
                      <div className="flex items-center justify-center">
                        <span className="text-yellow-400 text-lg">★</span>
                        <span className="ml-1 text-sm font-medium">{product.rating.toFixed(1)}</span>
                        {product.reviewCount && (
                          <span className="ml-1 text-xs text-gray-500">({product.reviewCount})</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-4 font-medium text-gray-700">Quality Score</td>
                {selectedProducts.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    {product.qualityScore ? (
                      <div className="flex items-center justify-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${(product.qualityScore / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium">{product.qualityScore}/10</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-700">Actions</td>
                {selectedProducts.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <a
                      href={product.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      View Deal
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {selectedProducts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium">No products selected for comparison</p>
          <p className="text-sm">Click on products above to add them to your comparison</p>
        </div>
      )}
    </div>
  );
} 