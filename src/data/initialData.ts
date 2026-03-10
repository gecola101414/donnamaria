import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // Tabaccheria (20 prodotti)
  { id: 't1', name: 'Marlboro Rosse', category: 'Tabaccheria', price: 6.00, cost: 5.40, stock: 50, minStock: 10 },
  { id: 't2', name: 'Marlboro Gold', category: 'Tabaccheria', price: 6.00, cost: 5.40, stock: 50, minStock: 10 },
  { id: 't3', name: 'Camel Blue', category: 'Tabaccheria', price: 5.40, cost: 4.86, stock: 50, minStock: 10 },
  { id: 't4', name: 'Camel Yellow', category: 'Tabaccheria', price: 5.40, cost: 4.86, stock: 50, minStock: 10 },
  { id: 't5', name: 'Lucky Strike Red', category: 'Tabaccheria', price: 5.00, cost: 4.50, stock: 50, minStock: 10 },
  { id: 't6', name: 'Lucky Strike Blue', category: 'Tabaccheria', price: 5.00, cost: 4.50, stock: 50, minStock: 10 },
  { id: 't7', name: 'Chesterfield Blue', category: 'Tabaccheria', price: 5.20, cost: 4.68, stock: 50, minStock: 10 },
  { id: 't8', name: 'Chesterfield Red', category: 'Tabaccheria', price: 5.20, cost: 4.68, stock: 50, minStock: 10 },
  { id: 't9', name: 'Winston Blue', category: 'Tabaccheria', price: 5.20, cost: 4.68, stock: 50, minStock: 10 },
  { id: 't10', name: 'Winston Red', category: 'Tabaccheria', price: 5.20, cost: 4.68, stock: 50, minStock: 10 },
  { id: 't11', name: 'Pueblo Classic (Trinciato 30g)', category: 'Tabaccheria', price: 6.50, cost: 5.85, stock: 50, minStock: 10 },
  { id: 't12', name: 'Pueblo Blue (Trinciato 30g)', category: 'Tabaccheria', price: 6.50, cost: 5.85, stock: 50, minStock: 10 },
  { id: 't13', name: 'Golden Virginia (Trinciato 30g)', category: 'Tabaccheria', price: 7.00, cost: 6.30, stock: 50, minStock: 10 },
  { id: 't14', name: 'Mac Baren Senza Nome Bianco (30g)', category: 'Tabaccheria', price: 6.80, cost: 6.12, stock: 50, minStock: 10 },
  { id: 't15', name: 'HEETS Amber', category: 'Tabaccheria', price: 5.50, cost: 4.95, stock: 50, minStock: 10 },
  { id: 't16', name: 'HEETS Turquoise', category: 'Tabaccheria', price: 5.50, cost: 4.95, stock: 50, minStock: 10 },
  { id: 't17', name: 'HEETS Yellow', category: 'Tabaccheria', price: 5.50, cost: 4.95, stock: 50, minStock: 10 },
  { id: 't18', name: 'Terea Sienna', category: 'Tabaccheria', price: 5.50, cost: 4.95, stock: 50, minStock: 10 },
  { id: 't19', name: 'Terea Bronze', category: 'Tabaccheria', price: 5.50, cost: 4.95, stock: 50, minStock: 10 },
  { id: 't20', name: 'Terea Amber', category: 'Tabaccheria', price: 5.50, cost: 4.95, stock: 50, minStock: 10 },
  
  // Caffetteria (5 prodotti)
  { id: 'c1', name: 'Caffè Espresso', category: 'Caffetteria', price: 1.20, cost: 0.20, stock: 500, minStock: 100 },
  { id: 'c2', name: 'Caffè Macchiato', category: 'Caffetteria', price: 1.30, cost: 0.25, stock: 200, minStock: 50 },
  { id: 'c3', name: 'Cappuccino', category: 'Caffetteria', price: 1.50, cost: 0.40, stock: 200, minStock: 50 },
  { id: 'c4', name: 'Latte Macchiato', category: 'Caffetteria', price: 2.00, cost: 0.50, stock: 100, minStock: 20 },
  { id: 'c5', name: 'Caffè Corretto', category: 'Caffetteria', price: 1.70, cost: 0.40, stock: 100, minStock: 20 },
  
  // Bibite (5 prodotti)
  { id: 'b1', name: 'Acqua Naturale 50cl', category: 'Bibite', price: 1.00, cost: 0.25, stock: 100, minStock: 20 },
  { id: 'b2', name: 'Acqua Frizzante 50cl', category: 'Bibite', price: 1.00, cost: 0.25, stock: 100, minStock: 20 },
  { id: 'b3', name: 'Coca Cola 33cl', category: 'Bibite', price: 2.50, cost: 0.80, stock: 50, minStock: 15 },
  { id: 'b4', name: 'Estathè Limone', category: 'Bibite', price: 2.50, cost: 0.80, stock: 50, minStock: 15 },
  { id: 'b5', name: 'Peroni 33cl', category: 'Bibite', price: 2.50, cost: 0.90, stock: 50, minStock: 15 },

  // Gelati (5 prodotti)
  { id: 'g1', name: 'Cornetto Classico', category: 'Gelati', price: 2.00, cost: 1.00, stock: 30, minStock: 10 },
  { id: 'g2', name: 'Magnum Classic', category: 'Gelati', price: 2.50, cost: 1.20, stock: 30, minStock: 10 },
  { id: 'g3', name: 'Coppa del Nonno', category: 'Gelati', price: 2.00, cost: 1.00, stock: 30, minStock: 10 },
  { id: 'g4', name: 'Fior di Fragola', category: 'Gelati', price: 1.50, cost: 0.70, stock: 30, minStock: 10 },
  { id: 'g5', name: 'Cremino', category: 'Gelati', price: 1.50, cost: 0.70, stock: 30, minStock: 10 },

  // Snack (5 prodotti)
  { id: 's1', name: 'Patatine Classiche', category: 'Snack', price: 1.50, cost: 0.50, stock: 50, minStock: 10 },
  { id: 's2', name: 'Fonzies', category: 'Snack', price: 1.50, cost: 0.50, stock: 50, minStock: 10 },
  { id: 's3', name: 'Taralli', category: 'Snack', price: 1.50, cost: 0.50, stock: 50, minStock: 10 },
  { id: 's4', name: 'Mars', category: 'Snack', price: 1.20, cost: 0.50, stock: 40, minStock: 10 },
  { id: 's5', name: 'Gocciole (Pacco)', category: 'Snack', price: 3.50, cost: 2.00, stock: 20, minStock: 5 },
];
