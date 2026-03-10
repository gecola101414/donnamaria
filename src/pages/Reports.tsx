import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calculator, TrendingUp, AlertCircle, Calendar, PackagePlus, Banknote } from 'lucide-react';

export const Reports: React.FC = () => {
  const { products, sales, creditTransactions } = useAppContext();
  const [daysToAnalyze, setDaysToAnalyze] = useState(7);
  const [targetDaysCoverage, setTargetDaysCoverage] = useState(14);

  // Calculate Reorders
  const reorderSuggestions = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToAnalyze);
    
    const recentSales = sales.filter(s => new Date(s.date) >= cutoffDate);
    
    const productSales = new Map<string, number>();
    recentSales.forEach(sale => {
      sale.items.forEach(item => {
        productSales.set(item.productId, (productSales.get(item.productId) || 0) + item.quantity);
      });
    });

    return products.map(p => {
      const soldInPeriod = productSales.get(p.id) || 0;
      const dailyAverage = soldInPeriod / daysToAnalyze;
      const projectedNeed = Math.ceil(dailyAverage * targetDaysCoverage);
      const suggestedReorder = Math.max(0, projectedNeed - p.stock);
      
      return {
        product: p,
        soldInPeriod,
        dailyAverage,
        suggestedReorder,
        isLowStock: p.stock <= p.minStock
      };
    }).filter(r => r.suggestedReorder > 0 || r.isLowStock)
      .sort((a, b) => b.suggestedReorder - a.suggestedReorder);
  }, [products, sales, daysToAnalyze, targetDaysCoverage]);

  // General Stats
  const totalCashSales = sales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.totalAmount, 0);
  const totalCreditPayments = creditTransactions.filter(tx => tx.type === 'payment').reduce((sum, tx) => sum + tx.amount, 0);
  const totalRealIncome = totalCashSales + totalCreditPayments;
  
  const totalProfit = sales.reduce((sum, s) => sum + s.totalProfit, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Report & Riordini</h2>

      {/* General Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mr-4">
            <Banknote size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Incasso Reale Storico</p>
            <p className="text-2xl font-bold text-slate-900">€{totalRealIncome.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Margine Totale Storico</p>
            <p className="text-2xl font-bold text-slate-900">€{totalProfit.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Reorder Calculator */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <Calculator size={20} className="mr-2 text-indigo-500" />
              Calcolo Automatico Riordini
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Basato sullo storico vendite per prevedere il fabbisogno futuro.
            </p>
          </div>
          
          <div className="flex items-center space-x-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 px-2">
              <Calendar size={16} className="text-slate-400" />
              <label className="text-sm text-slate-600">Analizza ultimi:</label>
              <select 
                value={daysToAnalyze}
                onChange={e => setDaysToAnalyze(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={3}>3 gg</option>
                <option value={7}>7 gg</option>
                <option value={14}>14 gg</option>
                <option value={30}>30 gg</option>
              </select>
            </div>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="flex items-center space-x-2 px-2">
              <PackagePlus size={16} className="text-slate-400" />
              <label className="text-sm text-slate-600">Copertura per:</label>
              <select 
                value={targetDaysCoverage}
                onChange={e => setTargetDaysCoverage(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={7}>7 gg</option>
                <option value={14}>14 gg</option>
                <option value={21}>21 gg</option>
                <option value={30}>30 gg</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {reorderSuggestions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <PackagePlus size={32} className="text-slate-400" />
              </div>
              <p className="text-lg font-medium text-slate-900">Nessun riordino suggerito</p>
              <p>Le scorte attuali sono sufficienti per coprire il periodo selezionato.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                  <th className="p-4 font-medium">Prodotto</th>
                  <th className="p-4 font-medium text-right">Venduti ({daysToAnalyze}gg)</th>
                  <th className="p-4 font-medium text-right">Media/Giorno</th>
                  <th className="p-4 font-medium text-right">Giacenza Attuale</th>
                  <th className="p-4 font-medium text-right bg-indigo-50/50 text-indigo-700">Riordino Suggerito</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reorderSuggestions.map(item => (
                  <tr key={item.product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900 flex items-center">
                        {item.product.name}
                        {item.isLowStock && (
                          <AlertCircle size={14} className="ml-2 text-amber-500" title="Sotto scorta minima" />
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{item.product.category}</div>
                    </td>
                    <td className="p-4 text-right text-slate-600">{item.soldInPeriod}</td>
                    <td className="p-4 text-right text-slate-600">{item.dailyAverage.toFixed(1)}</td>
                    <td className="p-4 text-right">
                      <span className={`font-medium ${item.isLowStock ? 'text-amber-600' : 'text-slate-900'}`}>
                        {item.product.stock}
                      </span>
                    </td>
                    <td className="p-4 text-right bg-indigo-50/30">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                        +{item.suggestedReorder}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};


