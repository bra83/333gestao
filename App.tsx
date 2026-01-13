
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
  
  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  
  const [apiUrl, setApiUrl] = useState<string>(() => {
    // @ts-ignore
    const htmlConfigUrl = window.APPS_SCRIPT_URL || "";
    return localStorage.getItem('APPS_SCRIPT_URL') || htmlConfigUrl;
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setInstallPrompt(null);
        }
      });
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

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
      const settingsRes = await fetch(`${targetUrl}?type=read_settings&t=${ts}`);
      let loadedSettings = { ...DEFAULT_SETTINGS };
      
      if (settingsRes.ok) {
         const settingsJson = await settingsRes.json();
         loadedSettings = { ...DEFAULT_SETTINGS, ...settingsJson };
         if (loadedSettings.vidaUtilHoras < 100) loadedSettings.vidaUtilHoras = 8000;
         if (loadedSettings.horasTrab < 1) loadedSettings.horasTrab = 160;
         if (loadedSettings.eficienciaFonte <= 0) loadedSettings.eficienciaFonte = 0.9;
         setSettings(loadedSettings);
      }

      const dataRes = await fetch(`${targetUrl}?type=read_data&t=${ts}`);
      if (!dataRes.ok) throw new Error("Erro na resposta do Google");
      
      const dataJson = await dataRes.json();

      const fixItem = (item: any, prefix: string, idx: number) => {
         const id = (item.id && String(item.id).trim() !== "") 
            ? String(item.id) 
            : `${prefix}-${ts}-${idx}`;

         const safeNum = (val: any) => {
            if (val === undefined || val === null) return 0;
            let num = 0;
            if (typeof val === 'number') {
              num = val;
            } else {
              let str = String(val).trim().replace(/[^\d.,-]/g, '');
              if (str.includes(',') && !str.includes('e')) {
                 str = str.replace(/\./g, '').replace(',', '.');
              }
              num = parseFloat(str);
            }
            if (!isFinite(num) || isNaN(num)) return 0;
            while (Math.abs(num) > 20000) {
              num = num / 10;
            }
            return num;
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
      
      showToast('Dados Atualizados');
      setLastError(null);
    } catch (err: any) {
      console.error(err);
      setLastError('Sem Conexão');
      showToast('Modo Offline');
      if (data.estoque.length === 0) setData(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
      showToast("Salvo localmente");
    }
  };

  const handleSaveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    if (apiUrl) {
      setLoading(true);
      await apiCall({ type: 'save_settings', ...newSettings });
      setLoading(false);
      showToast('Configurações Salvas');
    }
  };

  const handleMaintenance = async () => { fetchData(); };

  const executeDelete = async (type: string, id: string) => {
    const cleanId = String(id).trim();
    if (!cleanId) return;
    await apiCall({ type, action: 'delete', id: cleanId });
  };

  const handleAddStock = async (nome: string, marca: string, peso: number, preco: number, cor: string, tipo: string) => {
    const id = "ST" + Date.now();
    const newItem = { id, nome, marca, peso, preco, cor, tipo };
    setData(prev => ({ ...prev, estoque: [...prev.estoque, newItem] }));
    await apiCall({ type: 'estoque', action: 'create', ...newItem });
    showToast('Item Adicionado');
  };

  const handleUpdateStock = async (id: string, updates: Partial<StockItem>) => {
    const currentItem = data.estoque.find(i => i.id === id);
    if (!currentItem) return;
    const finalItem = { ...currentItem, ...updates };
    setData(prev => ({ ...prev, estoque: prev.estoque.map(item => item.id === id ? finalItem : item) }));
    await apiCall({ type: 'estoque', action: 'update', ...finalItem });
  };

  const handleDeleteStock = async (id: string) => {
    if (!window.confirm("Remover este item?")) return;
    setData(prev => ({ ...prev, estoque: prev.estoque.filter(item => item.id !== id) }));
    await executeDelete('estoque', id);
    showToast('Item Removido');
  };

  const handleAddSale = async (item: string, material: string, peso: number, venda: number, lucro: number, stockId?: string) => {
    const id = "VE" + Date.now();
    const newSale = { id, data: new Date().toISOString().split('T')[0], item, material, peso, venda, lucro };
    setData(prev => ({ ...prev, vendas: [newSale, ...prev.vendas] }));
    if (stockId) {
       const stockItem = data.estoque.find(s => s.id === stockId);
       if (stockItem) handleUpdateStock(stockId, { peso: Math.max(0, stockItem.peso - peso) });
    }
    await apiCall({ type: 'venda', action: 'create', ...newSale });
    showToast('Venda Registrada');
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
    showToast('Venda Removida');
  };

  const handleAddExpense = async (descricao: string, valor: number, dataStr: string) => {
    const id = "GA" + Date.now();
    const newExpense = { id, descricao, valor, data: dataStr };
    setData(prev => ({ ...prev, gastos: [newExpense, ...prev.gastos] }));
    await apiCall({ type: 'gasto', action: 'create', ...newExpense });
    showToast('Despesa Registrada');
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
    showToast('Despesa Removida');
  };

  const handleUrlChange = (val: string) => {
    setApiUrl(val);
    localStorage.setItem('APPS_SCRIPT_URL', val);
  };

  const NavButton = ({ v, icon: Icon, label }: { v: ViewState, icon: any, label: string }) => (
    <button onClick={() => setView(v)} className={`flex flex-col items-center justify-center w-full py-3 transition-all duration-300 ${view === v ? 'text-primary' : 'text-textMuted hover:text-primary/70'}`}>
      <div className={`p-1.5 rounded-2xl transition-all duration-300 ${view === v ? 'bg-white shadow-sm -translate-y-1' : ''}`}>
        <Icon active={view === v} />
      </div>
      <span className={`text-[10px] font-bold mt-1 ${view === v ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-bgBody text-textMain font-sans selection:bg-accent/20 selection:text-accent">
      
      {/* HEADER MODERNO COM LOGO */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 z-40 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative group">
            {/* LOGO DO GITHUB DO USUÁRIO */}
            <img 
              src="https://raw.githubusercontent.com/bra83/333gestao/main/icon-512.png" 
              alt="Logo" 
              className="w-10 h-10 rounded-xl shadow-sm group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h1 className="text-xl font-extrabold text-primary tracking-tight">333 Gestão</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {installPrompt && (
            <button 
              onClick={handleInstallClick}
              className="app-btn bg-primary text-white text-xs px-4 py-2 shadow-lg hover:bg-slate-800"
            >
              Instalar
            </button>
          )}
          
          {loading && <div className="w-5 h-5 border-2 border-slate-200 border-t-accent rounded-full animate-spin"></div>}
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-xl mx-auto space-y-6 pb-24">
        {view === ViewState.DASHBOARD && <DashboardView data={data} onNavigate={setView} />}
        {view === ViewState.CALCULATOR && <Calculator settings={settings} stock={data.estoque} onSaveSale={handleAddSale} />}
        {view === ViewState.INVENTORY && <InventoryView stock={data.estoque} onAddStock={handleAddStock} onUpdateStock={handleUpdateStock} onDeleteStock={handleDeleteStock} />}
        {view === ViewState.TRANSACTIONS && <TransactionsView sales={data.vendas} expenses={data.gastos} onUpdateSale={handleUpdateSale} onDeleteSale={handleDeleteSale} onAddExpense={handleAddExpense} onUpdateExpense={handleUpdateExpense} onDeleteExpense={handleDeleteExpense} />}
        {view === ViewState.SETTINGS && <SettingsView settings={settings} onSave={handleSaveSettings} apiUrl={apiUrl} onUrlChange={handleUrlChange} lastError={lastError} onRetry={fetchData} onMaintenance={handleMaintenance} />}
      </main>

      {/* MODERN NAV */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 pb-safe z-30 shadow-nav">
        <div className="flex justify-around max-w-xl mx-auto pt-2 px-2">
          <NavButton v={ViewState.DASHBOARD} icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="transition-all"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>} label="Início" />
          <NavButton v={ViewState.CALCULATOR} icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="transition-all"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/><line x1="8" y1="18" x2="8" y2="18"/><line x1="16" y1="18" x2="16" y2="18"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/></svg>} label="Calc" />
          <NavButton v={ViewState.INVENTORY} icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="transition-all"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>} label="Estoque" />
          <NavButton v={ViewState.TRANSACTIONS} icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-all"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} label="Caixa" />
          <NavButton v={ViewState.SETTINGS} icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="transition-all"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>} label="Config" />
        </div>
      </nav>
      
      {toast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-primary text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold z-50 animate-bounce flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {toast}
        </div>
      )}
    </div>
  );
};

export default App;
