import React, { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';

interface PriceAlertProps {
  currentPrice: number;
  onSetAlert: (price: number) => void;
  onRemoveAlert: () => void;
  alertPrice?: number;
}

export const PriceAlert: React.FC<PriceAlertProps> = ({
  currentPrice,
  onSetAlert,
  onRemoveAlert,
  alertPrice,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [price, setPrice] = useState(alertPrice || currentPrice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSetAlert(price);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-gray-500"
      >
        {alertPrice ? (
          <BellSolidIcon className="h-6 w-6 text-indigo-600" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <form onSubmit={handleSubmit} className="px-4 py-2">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Alert me when price drops below
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  $
                </span>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="mt-2 flex justify-between">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Set Alert
                </button>
                {alertPrice && (
                  <button
                    type="button"
                    onClick={() => {
                      onRemoveAlert();
                      setIsOpen(false);
                    }}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Remove
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}; 