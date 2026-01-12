
import React, { useState, useEffect, useCallback } from 'react';
import { Settings, AppData, ViewState, StockItem, Sale, Expense } from './types';
import { DEFAULT_SETTINGS, MOCK_DATA } from './constants';
import { Calculator } from './components/Calculator';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { SettingsView } from './components/SettingsView';
import { TransactionsView } from './components/TransactionsView';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [data, setData] = useState<AppData>({ estoque: [], vendas: [], gastos: [] });
  
  const [apiUrl, setApiUrl] = useState<string>(() => {
    // @ts-ignore
    const htmlConfigUrl = window.APPS_SCRIPT_URL || "";
    return localStorage.getItem('APPS_SCRIPT_URL') || htmlConfigUrl;
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // LEITURA (GET) - Versão Blindada e Corrigida Decimal
  const fetchData = useCallback(async () => {
    const targetUrl = apiUrl ? apiUrl.trim() : '';
    if (!targetUrl) {
      setSettings(DEFAULT_SETTINGS);
      setData(MOCK_DATA);
      return;
    }

    setLoading(true);
    try {
      const ts = new Date().getTime();
      // Busca Configurações
      const settingsRes = await fetch(`${targetUrl}?type=read_settings&t=${ts}`);
      let loadedSettings = { ...DEFAULT_SETTINGS };
      
      if (settingsRes.ok) {
         const settingsJson = await settingsRes.json();
         // SANITIZAÇÃO CRÍTICA DE SETTINGS
         // Garante que divisores nunca sejam zero para evitar números infinitos
         loadedSettings = { ...DEFAULT_SETTINGS, ...settingsJson };
         if (loadedSettings.vidaUtilHoras < 100) loadedSettings.vidaUtilHoras = 8000;
         if (loadedSettings.horasTrab < 1) loadedSettings.horasTrab = 160;
         if (loadedSettings.eficienciaFonte <= 0) loadedSettings.eficienciaFonte = 0.9;
         setSettings(loadedSettings);
      }

      // Busca Dados
      const dataRes = await fetch(`${targetUrl}?type=read_data&t=${ts}`);
      if (!dataRes.ok) throw new Error("Erro na resposta do Google");
      
      const dataJson = await dataRes.json();

      // Função Auxiliar INTELIGENTE para tratamento de números
      const fixItem = (item: any, prefix: string, idx: number) => {
         const id = (item.id && String(item.id).trim() !== "") 
            ? String(item.id) 
            : `${prefix}-${ts}-${idx}`;

         const safeNum = (val: any) => {
            if (typeof val === 'number') return isFinite(val) ? val : 0;
            if (!val) return 0;
            
            let str = String(val).trim();
            // Remove R$, espaços e caracteres não numéricos (exceto ponto, vírgula e menos)
            str = str.replace(/[^\d.,-]/g, '');

            // Lógica de Detecção de Formato
            // Se tiver vírgula, assume que é formato BR (ex: "1.200,50" ou "50,00")
            if (str.includes(',')) {
               str = str.replace(/\./g, '').replace(',', '.');
            }
            // Se NÃO tiver vírgula, mas tiver ponto (ex: "119.90"), assume que já é float internacional.
            
            const num = parseFloat(str);
            // Proteção contra números absurdos (Infinity ou > 1 trilhão)
            if (!isFinite(num) || Math.abs(num) > 1000000000000) return 0; 
            return isNaN(num) ? 0 : num;
         };

         return {
            ...item,
            id,
            peso: safeNum(item.peso),
            preco: safeNum(item.preco),
            venda: safeNum(item.venda),
            lucro: safeNum(item.lucro),
            valor: safeNum(item.valor)
         };
      };
      
      const safeList = (list: any[]) => Array.isArray(list) ? list : [];

      setData({ 
        estoque: safeList(dataJson.estoque).map((item, i) => fixItem(item, 'st', i)),
        vendas: safeList(dataJson.vendas).map((item, i) => fixItem(item, 've', i)),
        gastos: safeList(dataJson.gastos).map((item, i) => fixItem(item, 'ga', i))
      });
      
      showToast('Dados Atualizados!');
      setLastError(null);
    } catch (err: any) {
      console.error(err);
      setLastError('Erro de conexão ou script.');
      showToast('Modo Offline Ativado');
      if (data.estoque.length === 0) setData(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ESCRITA (POST via FormData)
  const apiCall = async (payload: any) => {
    if(!apiUrl) return;
    try {
      const formData = new FormData();
      Object.keys(payload).forEach(key => {
        formData.append(key, String(payload[key]));
      });

      await fetch(apiUrl, {
        method: 'POST',
        body: formData
      });
    } catch(e) { 
      console.error("API Error", e);
      showToast("Erro ao salvar nuvem (salvo local)");
    }
  };

  const handleSaveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    if (apiUrl) {
      setLoading(true);
      await apiCall({ type: 'save_settings', ...newSettings });
      setLoading(false);
      showToast('Configurações salvas!');
    }
  };

  const handleMaintenance = async () => {
    fetchData(); 
  };

  const executeDelete = async (type: string, id: string) => {
    const cleanId = String(id).trim();
    if (!cleanId) return;
    await apiCall({ type, action: 'delete', id: cleanId });
  };

  // --- ESTOQUE ---
  const handleAddStock = async (nome: string, marca: string, peso: number, preco: number, cor: string, tipo: string) => {
    const id = "ST" + Date.now();
    const newItem = { id, nome, marca, peso, preco, cor, tipo };
    setData(prev => ({ ...prev, estoque: [...prev.estoque, newItem] }));
    await apiCall({ type: 'estoque', action: 'create', ...newItem });
    showToast('Adicionado!');
  };

  const handleUpdateStock = async (id: string, updates: Partial<StockItem>) => {
    const currentItem = data.estoque.find(i => i.id === id);
    if (!currentItem) return;
    const finalItem = { ...currentItem, ...updates };
    setData(prev => ({ ...prev, estoque: prev.estoque.map(item => item.id === id ? finalItem : item) }));
    await apiCall({ type: 'estoque', action: 'update', ...finalItem });
  };

  const handleDeleteStock = async (id: string) => {
    if (!window.confirm("Apagar permanentemente?")) return;
    setData(prev => ({ ...prev, estoque: prev.estoque.filter(item => item.id !== id) }));
    await executeDelete('estoque', id);
    showToast('Removido!');
  };

  // --- VENDAS ---
  const handleAddSale = async (item: string, material: string, peso: number, venda: number, lucro: number, stockId?: string) => {
    const id = "VE" + Date.now();
    const newSale = { id, data: new Date().toISOString().split('T')[0], item, material, peso, venda, lucro };
    setData(prev => ({ ...prev, vendas: [newSale, ...prev.vendas] }));
    if (stockId) {
       const stockItem = data.estoque.find(s => s.id === stockId);
       if (stockItem) handleUpdateStock(stockId, { peso: Math.max(0, stockItem.peso - peso) });
    }
    await apiCall({ type: 'venda', action: 'create', ...newSale });
    showToast('Venda Registrada!');
    setView(ViewState.TRANSACTIONS);
  };

  const handleUpdateSale = async (id: string, newVal: number, newProfit: number) => {
    const sale = data.vendas.find(s => s.id === id);
    if (!sale) return;
    const updatedSale = { ...sale, venda: newVal, lucro: newProfit };
    setData(prev => ({ ...prev, vendas: prev.vendas.map(s => s.id === id ? updatedSale : s) }));
    await apiCall({ type: 'venda', action: 'update', ...updatedSale });
  };

  const handleDeleteSale = async (id: string) => {
    setData(prev => ({ ...prev, vendas: prev.vendas.filter(s => s.id !== id) }));
    await executeDelete('venda', id);
    showToast('Venda apagada!');
  };

  // --- GASTOS ---
  const handleAddExpense = async (descricao: string, valor: number, dataStr: string) => {
    const id = "GA" + Date.now();
    const newExpense = { id, descricao, valor, data: dataStr };
    setData(prev => ({ ...prev, gastos: [newExpense, ...prev.gastos] }));
    await apiCall({ type: 'gasto', action: 'create', ...newExpense });
    showToast('Gasto registrado!');
  };

  const handleUpdateExpense = async (id: string, descricao: string, valor: number) => {
    const exp = data.gastos.find(g => g.id === id);
    if (!exp) return;
    const updatedExp = { ...exp, descricao, valor };
    setData(prev => ({ ...prev, gastos: prev.gastos.map(g => g.id === id ? updatedExp : g) }));
    await apiCall({ type: 'gasto', action: 'update', ...updatedExp });
  };

  const handleDeleteExpense = async (id: string) => {
    setData(prev => ({ ...prev, gastos: prev.gastos.filter(g => g.id !== id) }));
    await executeDelete('gasto', id);
    showToast('Gasto removido!');
  };

  const handleUrlChange = (val: string) => {
    setApiUrl(val);
    localStorage.setItem('APPS_SCRIPT_URL', val);
  };

  const NavButton = ({ v, icon: Icon, label }: { v: ViewState, icon: any, label: string }) => (
    <button onClick={() => setView(v)} className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${view === v ? 'text-primary scale-110' : 'text-secondary hover:text-primary/70'}`}>
      <Icon /><span className="text-[10px] mt-1 font-bold">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-dark text-slate-600 font-sans">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-emerald-100 p-4 z-20 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center -space-x-1.5 select-none">
            <span className="text-4xl font-black text-primary tracking-tighter">3</span>
            <span className="text-4xl font-black text-emerald-300 tracking-tighter z-10">3</span>
            <span className="text-4xl font-black text-primary tracking-tighter">3</span>
          </div>
        </div>
        {loading && <div className="w-5 h-5 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>}
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {view === ViewState.DASHBOARD && <DashboardView data={data} onNavigate={setView} />}
        {view === ViewState.CALCULATOR && <Calculator settings={settings} stock={data.estoque} onSaveSale={handleAddSale} />}
        {view === ViewState.INVENTORY && <InventoryView stock={data.estoque} onAddStock={handleAddStock} onUpdateStock={handleUpdateStock} onDeleteStock={handleDeleteStock} />}
        {view === ViewState.TRANSACTIONS && <TransactionsView sales={data.vendas} expenses={data.gastos} onUpdateSale={handleUpdateSale} onDeleteSale={handleDeleteSale} onAddExpense={handleAddExpense} onUpdateExpense={handleUpdateExpense} onDeleteExpense={handleDeleteExpense} />}
        {view === ViewState.SETTINGS && <SettingsView settings={settings} onSave={handleSaveSettings} apiUrl={apiUrl} onUrlChange={handleUrlChange} lastError={lastError} onRetry={fetchData} onMaintenance={handleMaintenance} />}
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur border-t border-emerald-100 pb-safe z-30 shadow-sm">
        <div className="flex justify-around max-w-lg mx-auto pt-1">
          <NavButton v={ViewState.DASHBOARD} icon={() => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>} label="Início" />
          <NavButton v={ViewState.CALCULATOR} icon={() => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="4" y="2" width="16" height="20" rx="2"/></svg>} label="Calc" />
          <NavButton v={ViewState.INVENTORY} icon={() => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8l-7-4-7 4v8l7 4z"/></svg>} label="Estoque" />
          <NavButton v={ViewState.TRANSACTIONS} icon={() => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} label="Finanças" />
          <NavButton v={ViewState.SETTINGS} icon={() => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82"/></svg>} label="Config" />
        </div>
      </nav>
      
      {toast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white text-slate-700 px-6 py-3 rounded-full shadow-xl text-sm border border-emerald-100 z-50 animate-bounce font-bold">
          {toast}
        </div>
      )}
    </div>
  );
};

export default App;
