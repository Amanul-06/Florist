import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../api';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => Promise<void>;
  formatCurrency: (amount: number | null | undefined, showDecimals?: boolean) => string;
  shopName: string;
  setShopName: (name: string) => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<string>('₹');
  const [shopName, setShopNameState] = useState<string>('Bloom & Petal Florists');

  useEffect(() => {
    getSettings()
      .then(settings => {
        if (settings.currency) setCurrencyState(settings.currency);
        if (settings.shop_name) setShopNameState(settings.shop_name);
      })
      .catch(err => {
        console.error('Could not load settings from server, using defaults:', err);
      });
  }, []);

  const setCurrency = async (newCurrency: string) => {
    setCurrencyState(newCurrency);
    try {
      await updateSettings({ currency: newCurrency });
    } catch (e) {
      console.error('Failed to persist currency setting', e);
    }
  };

  const setShopName = async (newName: string) => {
    setShopNameState(newName);
    try {
      await updateSettings({ shop_name: newName });
    } catch (e) {
      console.error('Failed to persist shop name setting', e);
    }
  };

  const formatCurrency = (amount: number | null | undefined, showDecimals = false): string => {
    if (amount === null || amount === undefined || isNaN(amount)) return `${currency}0`;
    const formatted = showDecimals
      ? Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : Number(amount).toLocaleString(undefined, { maximumFractionDigits: 0 });
    return `${currency}${formatted}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, shopName, setShopName }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
