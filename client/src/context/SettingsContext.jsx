import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../services/api';

const SettingsContext = createContext(null);

const defaultSettings = {
  shop_name: 'MekongPOS',
  shop_address: '',
  shop_phone: '',
  tax_rate: 10,
  exchange_rate: 4100,
  currency_primary: 'USD',
  currency_secondary: 'KHR',
  receipt_footer: '',
  logo_url: '',
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await settingsAPI.getAll();
      const s = res.data.data || {};
      setSettings({
        shop_name: s.shop_name || defaultSettings.shop_name,
        shop_address: s.shop_address || '',
        shop_phone: s.shop_phone || '',
        tax_rate: parseFloat(s.tax_rate) || defaultSettings.tax_rate,
        exchange_rate: parseFloat(s.exchange_rate) || defaultSettings.exchange_rate,
        currency_primary: s.currency_primary || 'USD',
        currency_secondary: s.currency_secondary || 'KHR',
        receipt_footer: s.receipt_footer || '',
        logo_url: s.logo_url || '',
      });
    } catch {
      // keep defaults on error
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SettingsContext.Provider value={{ settings, loaded, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export default SettingsContext;
