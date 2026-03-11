import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Sale, SaleItem, Customer, CreditTransaction, CartItem } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialData';

interface AppContextType {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  creditTransactions: CreditTransaction[];
  favorites: string[];
  categories: string[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addStock: (id: string, quantity: number) => void;
  recordSale: (items: { product: Product; quantity: number }[], paymentMethod: 'cash' | 'credit', customerId?: string) => void;
  addCustomer: (name: string) => void;
  recordCreditPayment: (customerId: string, amount: number) => void;
  toggleFavorite: (productId: string) => void;
  addCategory: (category: string) => void;
  updateCategory: (oldName: string, newName: string) => void;
  deleteCategory: (name: string) => void;
  revertCreditSale: (transactionId: string) => void;
  revertCreditPayment: (transactionId: string) => void;
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

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('gestionale_categories');
    return saved ? JSON.parse(saved) : ['Tabaccheria', 'Snack', 'Gelati', 'Caffetteria', 'Bibite'];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('gestionale_cart');
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

  useEffect(() => {
    localStorage.setItem('gestionale_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('gestionale_cart', JSON.stringify(cart));
  }, [cart]);

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

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const updateCategory = (oldName: string, newName: string) => {
    if (oldName === newName) return;
    if (categories.includes(newName)) {
      alert('Una categoria con questo nome esiste già.');
      return;
    }
    setCategories(categories.map(c => c === oldName ? newName : c));
    setProducts(products.map(p => p.category === oldName ? { ...p, category: newName } : p));
  };

  const deleteCategory = (name: string) => {
    const newCategories = categories.filter(c => c !== name);
    const hasProducts = products.some(p => p.category === name);
    
    if (hasProducts && !newCategories.includes('Senza Categoria')) {
      newCategories.push('Senza Categoria');
    }
    
    setCategories(newCategories);
    setProducts(products.map(p => p.category === name ? { ...p, category: 'Senza Categoria' } : p));
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

  const revertCreditSale = (transactionId: string) => {
    const tx = creditTransactions.find(t => t.id === transactionId);
    if (!tx || tx.type !== 'charge' || !tx.saleId) return;

    const sale = sales.find(s => s.id === tx.saleId);
    if (!sale) return;

    // 1. Rimuovi la vendita
    setSales(sales.filter(s => s.id !== tx.saleId));

    // 2. Rimuovi la transazione
    setCreditTransactions(creditTransactions.filter(t => t.id !== transactionId));

    // 3. Ripristina il saldo del cliente
    setCustomers(customers.map(c => c.id === tx.customerId ? { ...c, balance: c.balance - tx.amount } : c));

    // 4. Ripristina le scorte
    setProducts(currentProducts => 
      currentProducts.map(p => {
        const soldItem = sale.items.find(i => i.productId === p.id);
        if (soldItem) {
          return { ...p, stock: p.stock + soldItem.quantity };
        }
        return p;
      })
    );

    // 5. Ricrea il carrello
    const recreatedCart = sale.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return product ? { product, quantity: item.quantity } : null;
    }).filter(Boolean) as CartItem[];

    setCart(recreatedCart);
  };

  const revertCreditPayment = (transactionId: string) => {
    const tx = creditTransactions.find(t => t.id === transactionId);
    if (!tx || tx.type !== 'payment') return;

    // 1. Rimuovi la transazione
    setCreditTransactions(creditTransactions.filter(t => t.id !== transactionId));

    // 2. Ripristina il saldo del cliente (riaggiungi il debito)
    setCustomers(customers.map(c => c.id === tx.customerId ? { ...c, balance: c.balance + tx.amount } : c));
  };

  return (
    <AppContext.Provider value={{ 
      products, sales, customers, creditTransactions, favorites, categories, cart, setCart,
      addProduct, updateProduct, deleteProduct, addStock, recordSale,
      addCustomer, recordCreditPayment, toggleFavorite, addCategory,
      updateCategory, deleteCategory, revertCreditSale, revertCreditPayment
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
