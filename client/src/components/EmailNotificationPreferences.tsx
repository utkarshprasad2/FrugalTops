import React, { useEffect, useState } from 'react';

interface EmailPrefs {
  wishlist: boolean;
  priceAlerts: boolean;
}

export function EmailNotificationPreferences() {
  const [prefs, setPrefs] = useState<EmailPrefs>({ wishlist: true, priceAlerts: true });

  useEffect(() => {
    const saved = localStorage.getItem('frugaltops-email-prefs');
    if (saved) setPrefs(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('frugaltops-email-prefs', JSON.stringify(prefs));
  }, [prefs]);

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">Email Notification Preferences</h3>
      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={prefs.wishlist}
            onChange={e => setPrefs(p => ({ ...p, wishlist: e.target.checked }))}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>Wishlist notifications</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={prefs.priceAlerts}
            onChange={e => setPrefs(p => ({ ...p, priceAlerts: e.target.checked }))}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>Price alert notifications</span>
        </label>
      </div>
    </div>
  );
} 