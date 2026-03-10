import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';
import { Plus, Search, Edit2, Trash2, PackagePlus } from 'lucide-react';

export const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, addStock } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Simple state for modals (in a real app, use proper modal components)
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Quick Add Stock state
  const [quickAddStockId, setQuickAddStockId] = useState<string | null>(null);
  const [quickAddQty, setQuickAddQty] = useState<string>('');
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', category: 'Tabaccheria', price: 0, cost: 0, stock: 0, minStock: 10
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.cost) return;
    
    if (editingId) {
      updateProduct(editingId, formData);
      setEditingId(null);
    } else {
      addProduct(formData as Omit<Product, 'id'>);
      setIsAdding(false);
    }
    setFormData({ name: '', category: 'Tabaccheria', price: 0, cost: 0, stock: 0, minStock: 10 });
  };

  const confirmQuickAddStock = () => {
    if (quickAddStockId && quickAddQty && !isNaN(parseInt(quickAddQty))) {
      addStock(quickAddStockId, parseInt(quickAddQty));
      setQuickAddStockId(null);
      setQuickAddQty('');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Magazzino</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl font-medium flex items-center hover:bg-slate-800 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Nuovo Prodotto
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <h3 className="text-lg font-bold mb-4">{editingId ? 'Modifica Prodotto' : 'Nuovo Prodotto'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Nome</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Categoria</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value as any})}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Tabaccheria">Tabaccheria</option>
                <option value="Caffetteria">Caffetteria</option>
                <option value="Bibite">Bibite</option>
                <option value="Gelati">Gelati</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Prezzo Vendita (€)</label>
              <input 
                type="number" step="0.01"
                value={formData.price} 
                onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Costo Acquisto (€)</label>
              <input 
                type="number" step="0.01"
                value={formData.cost} 
                onChange={e => setFormData({...formData, cost: parseFloat(e.target.value)})}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Giacenza Attuale</label>
              <input 
                type="number" 
                value={formData.stock} 
                onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Scorta Minima</label>
              <input 
                type="number" 
                value={formData.minStock} 
                onChange={e => setFormData({...formData, minStock: parseInt(e.target.value)})}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => { setIsAdding(false); setEditingId(null); }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Annulla
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600"
            >
              Salva Prodotto
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cerca per nome o categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="p-4 font-medium">Prodotto</th>
                <th className="p-4 font-medium">Categoria</th>
                <th className="p-4 font-medium text-right">Prezzo</th>
                <th className="p-4 font-medium text-right">Costo</th>
                <th className="p-4 font-medium text-right">Giacenza</th>
                <th className="p-4 font-medium text-center">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{p.name}</td>
                  <td className="p-4 text-slate-500">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-4 text-right text-slate-900">€{p.price.toFixed(2)}</td>
                  <td className="p-4 text-right text-slate-500">€{p.cost.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <span className={`font-bold ${p.stock <= p.minStock ? 'text-red-500' : 'text-slate-900'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => setQuickAddStockId(p.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        title="Carico Rapido"
                      >
                        <PackagePlus size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          setFormData(p);
                          setEditingId(p.id);
                          setIsAdding(false);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Modifica"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          if(window.confirm('Sei sicuro di voler eliminare questo prodotto?')) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Elimina"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Add Stock Modal */}
      {quickAddStockId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Carico Rapido</h3>
            <p className="text-sm text-slate-500 mb-4">
              {products.find(p => p.id === quickAddStockId)?.name}
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Quantità da aggiungere</label>
              <input
                type="number"
                autoFocus
                value={quickAddQty}
                onChange={(e) => setQuickAddQty(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmQuickAddStock()}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-bold"
                placeholder="Es. 10"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setQuickAddStockId(null);
                  setQuickAddQty('');
                }}
                className="flex-1 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={confirmQuickAddStock}
                disabled={!quickAddQty || isNaN(parseInt(quickAddQty))}
                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Aggiungi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
