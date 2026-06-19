import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from './LanguageContext';
import { useSettings } from './SettingsContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [items, setItems] = useState([]);
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(0);

  const taxRate = settings.tax_rate || 10;
  const exchangeRate = settings.exchange_rate || 4100;

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.qty >= (product.stock_qty ?? 9999)) {
          toast.error('Not enough stock');
          return prev;
        }
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      if ((product.stock_qty ?? 1) <= 0) {
        toast.error('Product is out of stock');
        return prev;
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          sell_price: parseFloat(product.sell_price),
          stock_qty: product.stock_qty ?? 9999,
          barcode: product.barcode,
          qty: 1,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  const updateQty = useCallback((productId, qty) => {
    const parsed = parseInt(qty, 10);
    if (isNaN(parsed) || parsed < 1) return;
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== productId) return i;
        const newQty = Math.min(parsed, i.stock_qty);
        if (parsed > i.stock_qty) {
          toast.error('Not enough stock');
        }
        return { ...i, qty: newQty };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscountType('percentage');
    setDiscountValue(0);
  }, []);

  const setDiscount = useCallback((type, value) => {
    setDiscountType(type);
    setDiscountValue(parseFloat(value) || 0);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.qty * i.sell_price, 0),
    [items]
  );

  const discountAmount = useMemo(() => {
    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    }
    return Math.min(discountValue, subtotal);
  }, [subtotal, discountType, discountValue]);

  const taxAmount = useMemo(
    () => ((subtotal - discountAmount) * taxRate) / 100,
    [subtotal, discountAmount, taxRate]
  );

  const total = useMemo(
    () => Math.max(subtotal - discountAmount + taxAmount, 0),
    [subtotal, discountAmount, taxAmount]
  );

  const totalKHR = useMemo(() => total * exchangeRate, [total, exchangeRate]);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        discountType,
        discountValue,
        setDiscount,
        subtotal,
        discountAmount,
        taxRate,
        taxAmount,
        total,
        totalKHR,
        itemCount,
        exchangeRate,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export default CartContext;
