import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Product, CartItem } from '../types';
import { Search, Plus, Minus, Trash2, ShoppingBag, Star, CreditCard, Banknote, Mic, MicOff } from 'lucide-react';

export const POS: React.FC = () => {
  const { products, sales, customers, favorites, recordSale, toggleFavorite, categories, cart, setCart } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('Più Usati');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'customer'>('method');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  
  const [isListening, setIsListening] = useState(false);
  const [lastHeard, setLastHeard] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Calculate product popularity
  const productPopularity = useMemo(() => {
    const counts = new Map<string, number>();
    sales.forEach(sale => {
      sale.items.forEach(item => {
        counts.set(item.productId, (counts.get(item.productId) || 0) + item.quantity);
      });
    });
    return counts;
  }, [sales]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterCategory === 'Più Usati') {
      filtered = filtered.filter(p => favorites.includes(p.id));
    } else if (filterCategory !== 'Tutti') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    // Sort by popularity (most sold first)
    return filtered.sort((a, b) => {
      const popA = productPopularity.get(a.id) || 0;
      const popB = productPopularity.get(b.id) || 0;
      return popB - popA;
    });
  }, [products, searchTerm, filterCategory, favorites, productPopularity]);

  const addToCart = (product: Product, qtyToAdd: number = 1) => {
    setCart(current => {
      const existing = current.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + qtyToAdd;
        if (newQty > product.stock) return current;
        return current.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: newQty } 
            : item
        );
      }
      if (product.stock < qtyToAdd) return current;
      return [...current, { product, quantity: qtyToAdd }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(current => current.map(item => {
      if (item.product.id === productId) {
        const newQuantity = item.quantity + delta;
        if (newQuantity > 0 && newQuantity <= item.product.stock) {
          return { ...item, quantity: newQuantity };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(current => current.filter(item => item.product.id !== productId));
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    if (paymentMethod === 'credit' && !selectedCustomer) {
      alert('Seleziona un cliente per il pagamento a credito.');
      return;
    }

    recordSale(cart, paymentMethod, paymentMethod === 'credit' ? selectedCustomer : undefined);
    setCart([]);
    setShowPaymentModal(false);
    setPaymentStep('method');
    setSelectedCustomer('');
    setPaymentMethod('cash');
    alert(`Vendita completata! Totale: €${total.toFixed(2)}`);
  };

  const handleOpenPaymentModal = () => {
    setPaymentStep('method');
    setPaymentMethod('cash');
    setSelectedCustomer('');
    setShowPaymentModal(true);
  };

  const toggleVoiceSearch = () => {
    if (isListening) {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      setLastHeard('');
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Il tuo browser non supporta il riconoscimento vocale.');
      return;
    }

    shouldListenRef.current = true;
    setIsListening(true);
    startRecognition();
  };

  const startRecognition = () => {
    if (!shouldListenRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = 'it-IT';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onresult = (event: any) => {
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript.trim();
      
      setLastHeard(transcript);
      setTimeout(() => setLastHeard(''), 4000); // Nascondi dopo 4 secondi
      
      // Normalizza il testo: minuscolo, rimuovi accenti
      const normalizedTranscript = transcript.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      const numberMap: { [key: string]: number } = {
        'un': 1, 'uno': 1, 'una': 1, 'due': 2, 'tre': 3, 'quattro': 4, 'cinque': 5,
        'sei': 6, 'sette': 7, 'otto': 8, 'nove': 9, 'dieci': 10
      };

      // Trova la quantità (cerca il primo numero nella frase)
      let qty = 1;
      const words = normalizedTranscript.split(/\s+/);
      for (const word of words) {
        if (!isNaN(parseInt(word))) {
          qty = parseInt(word);
          break;
        } else if (numberMap[word]) {
          qty = numberMap[word];
          break;
        }
      }

      // Ordina i prodotti dal nome più lungo al più corto per evitare falsi positivi parziali
      const sortedProducts = [...products].sort((a, b) => b.name.length - a.name.length);
      
      let found = false;
      
      // Tentativo 1: Ricerca esatta della stringa normalizzata
      for (const p of sortedProducts) {
        const normalizedPName = p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (normalizedTranscript.includes(normalizedPName)) {
          addToCart(p, qty);
          found = true;
          break;
        }
      }
      
      // Tentativo 2: Ricerca "Fuzzy" (se tutte le parole del prodotto sono nella frase)
      if (!found) {
        for (const p of sortedProducts) {
          const pWords = p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/);
          // Controlla se ogni parola del nome del prodotto è presente nella frase pronunciata
          const allWordsPresent = pWords.every(pw => normalizedTranscript.includes(pw));
          if (allWordsPresent) {
            addToCart(p, qty);
            found = true;
            break;
          }
        }
      }
      
      if (!found) {
        console.log(`Non ho trovato prodotti per: "${transcript}"`);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Errore riconoscimento vocale:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        alert('Permesso per il microfono negato. Assicurati di aver concesso l\'accesso al microfono nel browser.');
        shouldListenRef.current = false;
        setIsListening(false);
      }
      // Ignoriamo errori come 'no-speech' per permettere il riavvio automatico in onend
    };
    
    recognition.onend = () => {
      if (shouldListenRef.current) {
        // Invece di riavviare la stessa istanza (che causa bug in Chrome),
        // creiamo una nuova istanza chiamando di nuovo startRecognition()
        setTimeout(() => {
          if (shouldListenRef.current) {
            startRecognition();
          }
        }, 250);
      } else {
        setIsListening(false);
      }
    };
    
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      // Se fallisce l'avvio, riproviamo dopo un istante creando una nuova istanza
      if (shouldListenRef.current) {
        setTimeout(() => {
          if (shouldListenRef.current) {
            startRecognition();
          }
        }, 500);
      }
    }
  };

  const displayCategories = ['Più Usati', 'Tutti', ...categories];

  return (
    <div className="flex h-full gap-4 relative">
      {/* Products Section */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cerca prodotto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex flex-wrap gap-2 pb-2">
            {displayCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  filterCategory === cat 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'Più Usati' ? <span className="flex items-center"><Star size={12} className="mr-1" /> {cat}</span> : cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {/* Grid with responsive columns for products */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredProducts.map(p => (
              <div key={p.id} className="relative group">
                <button
                  onClick={() => addToCart(p)}
                  disabled={p.stock <= 0}
                  className={`w-full p-3 rounded-xl border text-left transition-all h-full flex flex-col ${
                    p.stock <= 0 
                      ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50' 
                      : 'border-slate-200 hover:border-emerald-500 hover:shadow-md bg-white'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-500 mb-1">{p.category}</div>
                  <div className="font-medium text-slate-900 leading-tight mb-2 flex-1">{p.name}</div>
                  <div className="flex items-center justify-between w-full mt-auto">
                    <span className="font-bold text-emerald-600">€{p.price.toFixed(2)}</span>
                    <span className={`text-xs ${p.stock <= p.minStock ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                      {p.stock} pz
                    </span>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(p.id);
                  }}
                  className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${
                    favorites.includes(p.id) 
                      ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
                      : 'text-slate-300 hover:text-yellow-500 hover:bg-slate-100 opacity-0 group-hover:opacity-100'
                  }`}
                  title={favorites.includes(p.id) ? "Rimuovi dai Più Usati" : "Aggiungi ai Più Usati"}
                >
                  <Star size={16} fill={favorites.includes(p.id) ? "currentColor" : "none"} />
                </button>
              </div>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center text-slate-500 mt-10">
              Nessun prodotto trovato in questa categoria.
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <ShoppingBag size={20} className="mr-2" />
            Scontrino
          </h3>
          <div className="flex items-center space-x-3">
            {lastHeard && (
              <span className="text-xs text-slate-500 italic truncate max-w-[120px] animate-pulse" title={lastHeard}>
                "{lastHeard}"
              </span>
            )}
            <button
              onClick={toggleVoiceSearch}
              className={`p-2 px-3 rounded-xl border flex items-center justify-center transition-colors ${
                isListening 
                  ? 'bg-emerald-500 text-white border-emerald-500 animate-pulse shadow-md shadow-emerald-500/20' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Aggiungi con la voce (es: 'due caffè')"
            >
              {isListening ? <Mic size={18} className="mr-2" /> : <MicOff size={18} className="mr-2" />}
              <span className="font-medium text-sm">{isListening ? 'Ascolto...' : 'Voce'}</span>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <p>Nessun prodotto selezionato</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex-1 pr-2">
                  <p className="font-medium text-slate-900 text-xs leading-tight">{item.product.name}</p>
                  <p className="text-emerald-600 font-bold text-xs">€{(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-5 text-center font-medium text-xs">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    <Plus size={12} />
                  </button>
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="w-7 h-7 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg ml-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-600 font-medium">Totale</span>
            <span className="text-3xl font-bold text-slate-900">€{total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleOpenPaymentModal}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
              cart.length === 0 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20'
            }`}
          >
            Procedi al Pagamento
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full mx-4">
            {paymentStep === 'method' ? (
              <>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Metodo di Pagamento</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center transition-colors ${
                      paymentMethod === 'cash' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-slate-200 text-slate-500 hover:border-emerald-200'
                    }`}
                  >
                    <Banknote size={48} className="mb-4" />
                    <span className="font-bold text-lg">Contanti/Carta</span>
                  </button>
                  <button
                    onClick={() => {
                      setPaymentMethod('credit');
                      setPaymentStep('customer');
                    }}
                    className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center transition-colors border-slate-200 text-slate-500 hover:border-indigo-200`}
                  >
                    <CreditCard size={48} className="mb-4" />
                    <span className="font-bold text-lg">Libretto Credito</span>
                  </button>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-lg"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleCheckout}
                    className={`flex-1 py-4 rounded-xl font-bold text-white transition-colors bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20 text-lg`}
                  >
                    Conferma (€{total.toFixed(2)})
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Seleziona Cliente (Credito)</h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6 max-h-80 overflow-y-auto p-1">
                  {customers.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCustomer(c.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedCustomer === c.id
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500 ring-offset-2 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold truncate text-sm">{c.name}</div>
                      <div className={`text-xs mt-1 font-medium ${c.balance > 0 ? 'text-red-500' : 'text-slate-500'}`}>
                        Saldo: €{c.balance.toFixed(2)}
                      </div>
                    </button>
                  ))}
                  {customers.length === 0 && (
                    <div className="col-span-full text-center text-slate-500 py-8">
                      Nessun cliente registrato nel libretto.
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setPaymentStep('method');
                      setPaymentMethod('cash');
                      setSelectedCustomer('');
                    }}
                    className="flex-1 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-lg"
                  >
                    Annulla Credito
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={!selectedCustomer}
                    className={`flex-1 py-4 rounded-xl font-bold text-white transition-colors text-lg ${
                      !selectedCustomer
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-indigo-500 hover:bg-indigo-600 shadow-md shadow-indigo-500/20'
                    }`}
                  >
                    Conferma (€{total.toFixed(2)})
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

