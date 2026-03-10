import React from 'react';
import { useAppContext } from '../context/AppContext';
import { TrendingUp, AlertTriangle, Package, DollarSign, BookUser } from 'lucide-react';

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
    </div>
  );
};
