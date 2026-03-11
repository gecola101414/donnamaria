import React from 'react';
import { useAppContext } from '../context/AppContext';
import { TrendingUp, AlertTriangle, Package, DollarSign, BookUser, FileText } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { products, sales, customers, creditTransactions } = useAppContext();

  // Calculate today's sales
  const today = new Date().toISOString().split('T')[0];
  
  // Real income today = Cash sales + Credit payments received today
  const todaysCashSales = sales.filter(s => s.date.startsWith(today) && s.paymentMethod === 'cash');
  const todaysCreditPayments = creditTransactions.filter(tx => tx.date.startsWith(today) && tx.type === 'payment');
  
  const todayCashRevenue = todaysCashSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const todayCreditPaymentsReceived = todaysCreditPayments.reduce((sum, tx) => sum + tx.amount, 0);
  const todayRealIncome = todayCashRevenue + todayCreditPaymentsReceived;

  // Profit calculation (based on all sales, regardless of payment method)
  const todaysAllSales = sales.filter(s => s.date.startsWith(today));
  const todayProfit = todaysAllSales.reduce((sum, s) => sum + s.totalProfit, 0);

  // Outstanding credit
  const totalOutstandingCredit = customers.reduce((sum, c) => sum + c.balance, 0);

  // Low stock products
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // Reconciliation data (Today's sales grouped by product)
  const salesByProduct = new Map<string, { 
    name: string, 
    category: string, 
    quantity: number, 
    price: number, 
    cost: number,
    totalRevenue: number,
    totalCost: number,
    totalProfit: number
  }>();
  
  todaysAllSales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      const name = product ? product.name : 'Prodotto Eliminato';
      const category = product ? product.category : '-';
      
      const itemRevenue = item.priceAtSale * item.quantity;
      const itemCost = item.costAtSale * item.quantity;
      const itemProfit = itemRevenue - itemCost;

      const existing = salesByProduct.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.totalRevenue += itemRevenue;
        existing.totalCost += itemCost;
        existing.totalProfit += itemProfit;
      } else {
        salesByProduct.set(item.productId, {
          name,
          category,
          quantity: item.quantity,
          price: item.priceAtSale,
          cost: item.costAtSale,
          totalRevenue: itemRevenue,
          totalCost: itemCost,
          totalProfit: itemProfit
        });
      }
    });
  });

  const reconciliationList = Array.from(salesByProduct.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  const reconciliationTotalRevenue = reconciliationList.reduce((sum, item) => sum + item.totalRevenue, 0);
  const reconciliationTotalCost = reconciliationList.reduce((sum, item) => sum + item.totalCost, 0);
  const reconciliationTotalProfit = reconciliationList.reduce((sum, item) => sum + item.totalProfit, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Incasso Reale Oggi</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">€{todayRealIncome.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 flex justify-between">
            <span>Vendite: €{todayCashRevenue.toFixed(2)}</span>
            <span>Riscossioni: €{todayCreditPaymentsReceived.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Crediti da Riscuotere</p>
              <p className="text-3xl font-bold text-red-500 mt-1">€{totalOutstandingCredit.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <BookUser size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Margine Oggi (Totale)</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">€{todayProfit.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Allarmi Scorte</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{lowStockProducts.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-amber-50/50">
            <h3 className="text-lg font-semibold text-amber-900 flex items-center">
              <AlertTriangle size={20} className="mr-2" />
              Prodotti in Esaurimento
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {lowStockProducts.map(p => (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{p.name}</p>
                  <p className="text-sm text-slate-500">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-amber-600">{p.stock} pz</p>
                  <p className="text-xs text-slate-500">Minimo: {p.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Reconciliation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <FileText size={20} className="mr-2 text-indigo-500" />
            Rendiconto Giornaliero (Chiusura)
          </h3>
          <span className="text-sm font-medium text-slate-500">
            {new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="p-4 font-medium">Prodotto</th>
                <th className="p-4 font-medium text-right">Q.tà</th>
                <th className="p-4 font-medium text-right">Costo Unit.</th>
                <th className="p-4 font-medium text-right">Prezzo Unit.</th>
                <th className="p-4 font-medium text-right">Costo Totale</th>
                <th className="p-4 font-medium text-right">Incasso Totale</th>
                <th className="p-4 font-medium text-right text-emerald-600">Utile (Margine)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reconciliationList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Nessuna vendita registrata oggi.
                  </td>
                </tr>
              ) : (
                reconciliationList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.category}</p>
                    </td>
                    <td className="p-4 text-right font-medium text-slate-700">{item.quantity}</td>
                    <td className="p-4 text-right text-slate-500">€{item.cost.toFixed(2)}</td>
                    <td className="p-4 text-right text-slate-500">€{item.price.toFixed(2)}</td>
                    <td className="p-4 text-right font-medium text-slate-700">€{item.totalCost.toFixed(2)}</td>
                    <td className="p-4 text-right font-bold text-slate-900">€{item.totalRevenue.toFixed(2)}</td>
                    <td className="p-4 text-right font-bold text-emerald-600">€{item.totalProfit.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {reconciliationList.length > 0 && (
              <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                <tr>
                  <td colSpan={4} className="p-4 text-right font-bold text-slate-700">
                    Totali Chiusura:
                  </td>
                  <td className="p-4 text-right font-bold text-slate-700">
                    €{reconciliationTotalCost.toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-bold text-xl text-slate-900">
                    €{reconciliationTotalRevenue.toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-bold text-xl text-emerald-600">
                    €{reconciliationTotalProfit.toFixed(2)}
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
