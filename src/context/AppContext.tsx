import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Sale, SaleItem, Customer, CreditTransaction } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialData';

interface AppContextType {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  creditTransactions: CreditTransaction[];
  favorites: string[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addStock: (id: string, quantity: number) => void;
  recordSale: (items: { product: Product; quantity: number }[], paymentMethod: 'cash' | 'credit', customerId?: string) => void;
  addCustomer: (name: string) => void;
  recordCreditPayment: (customerId: string, amount: number) => void;
  toggleFavorite: (productId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('gestionale_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('gestionale_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('gestionale_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>(() => {
    const saved = localStorage.getItem('gestionale_credit_tx');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('gestionale_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('gestionale_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('gestionale_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('gestionale_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('gestionale_credit_tx', JSON.stringify(creditTransactions));
  }, [creditTransactions]);

  useEffect(() => {
    localStorage.setItem('gestionale_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now().toString() };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    setFavorites(favorites.filter(fid => fid !== id));
  };

  const addStock = (id: string, quantity: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, stock: p.stock + quantity } : p));
  };

  const addCustomer = (name: string) => {
    const newCustomer: Customer = { id: Date.now().toString(), name, balance: 0 };
    setCustomers([...customers, newCustomer]);
  };

  const recordCreditPayment = (customerId: string, amount: number) => {
    const tx: CreditTransaction = {
      id: Date.now().toString(),
      customerId,
      amount,
      type: 'payment',
      date: new Date().toISOString()
    };
    setCreditTransactions([...creditTransactions, tx]);
    setCustomers(customers.map(c => c.id === customerId ? { ...c, balance: c.balance - amount } : c));
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(current => 
      current.includes(productId) 
        ? current.filter(id => id !== productId)
        : [...current, productId]
    );
  };

  const recordSale = (items: { product: Product; quantity: number }[], paymentMethod: 'cash' | 'credit', customerId?: string) => {
    const saleItems: SaleItem[] = items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      priceAtSale: item.product.price,
      costAtSale: item.product.cost,
    }));

    const totalAmount = saleItems.reduce((sum, item) => sum + (item.priceAtSale * item.quantity), 0);
    const totalProfit = saleItems.reduce((sum, item) => sum + ((item.priceAtSale - item.costAtSale) * item.quantity), 0);

    const newSale: Sale = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: saleItems,
      totalAmount,
      totalProfit,
      paymentMethod,
      customerId
    };

    setSales([...sales, newSale]);

    if (paymentMethod === 'credit' && customerId) {
      const tx: CreditTransaction = {
        id: Date.now().toString(),
        customerId,
        amount: totalAmount,
        type: 'charge',
        date: newSale.date,
        saleId: newSale.id
      };
      setCreditTransactions([...creditTransactions, tx]);
      setCustomers(customers.map(c => c.id === customerId ? { ...c, balance: c.balance + totalAmount } : c));
    }

    // Update stock
    setProducts(currentProducts => 
      currentProducts.map(p => {
        const soldItem = items.find(i => i.product.id === p.id);
        if (soldItem) {
          return { ...p, stock: p.stock - soldItem.quantity };
        }
        return p;
      })
    );
  };

  return (
    <AppContext.Provider value={{ 
      products, sales, customers, creditTransactions, favorites,
      addProduct, updateProduct, deleteProduct, addStock, recordSale,
      addCustomer, recordCreditPayment, toggleFavorite
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
