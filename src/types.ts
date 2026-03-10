export type Category = 'Tabaccheria' | 'Caffetteria' | 'Bibite' | 'Gelati' | 'Snack';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  priceAtSale: number;
  costAtSale: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  totalAmount: number;
  totalProfit: number;
  paymentMethod: 'cash' | 'credit';
  customerId?: string;
}

export interface Customer {
  id: string;
  name: string;
  balance: number;
}

export interface CreditTransaction {
  id: string;
  customerId: string;
  amount: number;
  type: 'charge' | 'payment';
  date: string;
  saleId?: string;
}
