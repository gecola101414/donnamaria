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
      const reorderCost = suggestedReorder * p.cost;
      
      return {
        product: p,
        soldInPeriod,
        dailyAverage,
        suggestedReorder,
        reorderCost,
        isLowStock: p.stock <= p.minStock
      };
    }).filter(r => r.suggestedReorder > 0 || r.isLowStock)
      .sort((a, b) => b.suggestedReorder - a.suggestedReorder);
  }, [products, sales, daysToAnalyze, targetDaysCoverage]);

  const totalReorderCost = reorderSuggestions.reduce((sum, item) => sum + item.reorderCost, 0);

  // Historical Sales Summary by Product
  const historicalSalesSummary = useMemo(() => {
    const summary = new Map<string, { name: string, category: string, quantity: number, revenue: number, cost: number, profit: number }>();
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const name = product ? product.name : 'Prodotto Eliminato';
        const category = product ? product.category : '-';
        
        const existing = summary.get(item.productId);
        const itemRevenue = item.priceAtSale * item.quantity;
        const itemCost = item.costAtSale * item.quantity;
        const itemProfit = itemRevenue - itemCost;

        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += itemRevenue;
          existing.cost += itemCost;
          existing.profit += itemProfit;
        } else {
          summary.set(item.productId, {
            name,
            category,
            quantity: item.quantity,
            revenue: itemRevenue,
            cost: itemCost,
            profit: itemProfit
          });
        }
      });
    });

    return Array.from(summary.values()).sort((a, b) => b.revenue - a.revenue);
  }, [sales, products]);

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
                  <th className="p-4 font-medium text-right bg-indigo-50/50 text-indigo-700">Costo Stimato</th>
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
                    <td className="p-4 text-right bg-indigo-50/30 font-bold text-slate-900">
                      €{item.reorderCost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                <tr>
                  <td colSpan={5} className="p-4 text-right font-bold text-slate-700">
                    Costo Totale Stimato per il Riordino:
                  </td>
                  <td className="p-4 text-right font-bold text-xl text-indigo-600">
                    €{totalReorderCost.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      {/* Historical Sales Summary Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <TrendingUp size={20} className="mr-2 text-emerald-500" />
            Riepilogo Dettagliato Vendite Storiche
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Dettaglio dei ricavi, costi e margini per ogni singolo prodotto venduto.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="p-4 font-medium">Prodotto</th>
                <th className="p-4 font-medium text-right">Q.tà Venduta</th>
                <th className="p-4 font-medium text-right">Costo Totale (Riga)</th>
                <th className="p-4 font-medium text-right">Incasso Totale (Riga)</th>
                <th className="p-4 font-medium text-right text-emerald-600">Margine (Utile)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historicalSalesSummary.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Nessuna vendita registrata.
                  </td>
                </tr>
              ) : (
                historicalSalesSummary.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.category}</p>
                    </td>
                    <td className="p-4 text-right font-medium text-slate-700">{item.quantity}</td>
                    <td className="p-4 text-right text-slate-500">€{item.cost.toFixed(2)}</td>
                    <td className="p-4 text-right font-medium text-slate-900">€{item.revenue.toFixed(2)}</td>
                    <td className="p-4 text-right font-bold text-emerald-600">€{item.profit.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {historicalSalesSummary.length > 0 && (
              <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                <tr>
                  <td colSpan={2} className="p-4 text-right font-bold text-slate-700">
                    Totali Complessivi:
                  </td>
                  <td className="p-4 text-right font-bold text-slate-700">
                    €{historicalSalesSummary.reduce((sum, i) => sum + i.cost, 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-bold text-slate-900">
                    €{historicalSalesSummary.reduce((sum, i) => sum + i.revenue, 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-bold text-xl text-emerald-600">
                    €{totalProfit.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};


