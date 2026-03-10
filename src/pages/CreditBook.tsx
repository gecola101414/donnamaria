import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserPlus, CreditCard, History, Search, BookUser } from 'lucide-react';

export const CreditBook: React.FC = () => {
  const { customers, creditTransactions, addCustomer, recordCreditPayment } = useAppContext();
  const [newCustomerName, setNewCustomerName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomerName.trim()) {
      addCustomer(newCustomerName.trim());
      setNewCustomerName('');
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (selectedCustomer && !isNaN(amount) && amount > 0) {
      recordCreditPayment(selectedCustomer, amount);
      setPaymentAmount('');
      setSelectedCustomer(null);
      alert('Pagamento registrato con successo!');
    }
  };

  const activeCustomer = customers.find(c => c.id === selectedCustomer);
  const customerTransactions = creditTransactions
    .filter(tx => tx.customerId === selectedCustomer)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Libretto Crediti</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customers List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <form onSubmit={handleAddCustomer} className="flex gap-4 mb-6">
              <input
                type="text"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="Nome nuovo cliente..."
                className="flex-1 p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button 
                type="submit"
                disabled={!newCustomerName.trim()}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-slate-800 disabled:opacity-50"
              >
                <UserPlus size={20} className="mr-2" />
                Aggiungi
              </button>
            </form>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Cerca cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-3">
              {filteredCustomers.map(customer => (
                <div 
                  key={customer.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors cursor-pointer ${
                    selectedCustomer === customer.id 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                  onClick={() => setSelectedCustomer(customer.id)}
                >
                  <div>
                    <h3 className="font-bold text-slate-900">{customer.name}</h3>
                    <p className="text-sm text-slate-500">ID: {customer.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Da saldare</p>
                    <p className={`text-xl font-bold ${customer.balance > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                      €{customer.balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              {filteredCustomers.length === 0 && (
                <p className="text-center text-slate-500 py-4">Nessun cliente trovato.</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment & History Panel */}
        <div className="lg:col-span-1">
          {activeCustomer ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-6">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">{activeCustomer.name}</h3>
                <p className="text-slate-500">Saldo attuale: <span className={`font-bold ${activeCustomer.balance > 0 ? 'text-red-500' : 'text-emerald-600'}`}>€{activeCustomer.balance.toFixed(2)}</span></p>
              </div>

              {activeCustomer.balance > 0 && (
                <div className="p-6 border-b border-slate-100">
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                    <CreditCard size={18} className="mr-2" />
                    Registra Pagamento
                  </h4>
                  <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Importo (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={activeCustomer.balance}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentAmount(activeCustomer.balance.toString())}
                        className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
                      >
                        Saldo Totale
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600"
                      >
                        Paga
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="p-6">
                <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                  <History size={18} className="mr-2" />
                  Storico Movimenti
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {customerTransactions.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center">Nessun movimento.</p>
                  ) : (
                    customerTransactions.map(tx => (
                      <div key={tx.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-700">
                            {tx.type === 'charge' ? 'Addebito (Spesa)' : 'Pagamento'}
                          </p>
                          <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleString()}</p>
                        </div>
                        <span className={`font-bold ${tx.type === 'charge' ? 'text-red-500' : 'text-emerald-600'}`}>
                          {tx.type === 'charge' ? '-' : '+'}€{tx.amount.toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-500 h-full flex flex-col items-center justify-center">
              <BookUser size={48} className="mb-4 opacity-20" />
              <p>Seleziona un cliente per gestire i pagamenti e visualizzare lo storico.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
