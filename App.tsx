
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
      
      showToast('Jogo Salvo Carregado!');
      setLastError(null);
    } catch (err: any) {
      console.error(err);
      setLastError('Connection Lost');
      showToast('Offline Mode');
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
      showToast("Falha ao salvar (Local only)");
    }
  };

  const handleSaveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    if (apiUrl) {
      setLoading(true);
      await apiCall({ type: 'save_settings', ...newSettings });
      setLoading(false);
      showToast('Configurações Salvas!');
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
    showToast('Item Obtido!');
  };

  const handleUpdateStock = async (id: string, updates: Partial<StockItem>) => {
    const currentItem = data.estoque.find(i => i.id === id);
    if (!currentItem) return;
    const finalItem = { ...currentItem, ...updates };
    setData(prev => ({ ...prev, estoque: prev.estoque.map(item => item.id === id ? finalItem : item) }));
    await apiCall({ type: 'estoque', action: 'update', ...finalItem });
  };

  const handleDeleteStock = async (id: string) => {
    if (!window.confirm("Dropar item?")) return;
    setData(prev => ({ ...prev, estoque: prev.estoque.filter(item => item.id !== id) }));
    await executeDelete('estoque', id);
    showToast('Item Removido!');
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
    showToast('Venda Realizada!');
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
    showToast('Registro Apagado!');
  };

  const handleAddExpense = async (descricao: string, valor: number, dataStr: string) => {
    const id = "GA" + Date.now();
    const newExpense = { id, descricao, valor, data: dataStr };
    setData(prev => ({ ...prev, gastos: [newExpense, ...prev.gastos] }));
    await apiCall({ type: 'gasto', action: 'create', ...newExpense });
    showToast('Gasto Anotado!');
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
    showToast('Gasto Removido!');
  };

  const handleUrlChange = (val: string) => {
    setApiUrl(val);
    localStorage.setItem('APPS_SCRIPT_URL', val);
  };

  const NavButton = ({ v, icon: Icon, label }: { v: ViewState, icon: any, label: string }) => (
    <button onClick={() => setView(v)} className={`flex flex-col items-center justify-center w-full py-3 transition-all duration-200 active:scale-90 ${view === v ? 'text-primary scale-110' : 'text-secondary hover:text-primary/70'}`}>
      <div className={`p-1.5 rounded-lg border-2 ${view === v ? 'bg-bgPaper border-primary shadow-retro-active' : 'bg-transparent border-transparent'}`}>
        <Icon active={view === v} />
      </div>
      <span className={`text-[10px] font-pixel mt-1 tracking-widest uppercase ${view === v ? 'text-primary font-bold' : 'text-secondary opacity-70'}`}>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-bgPaper text-bgDark font-sans selection:bg-accent selection:text-bgDark">
      
      {/* RETRO HEADER */}
      <header className="sticky top-0 bg-[#e8e4d3] border-b-4 border-secondary px-5 py-3 z-40 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-0.5 select-none cursor-default drop-shadow-md">
            {/* LOGO TRIFORCE COLORS: Rosa/Vermelho, Verde, Azul/Roxo */}
            <span className="text-4xl font-pixel text-heart tracking-tight animate-bounce" style={{animationDelay: '0s'}}>3</span>
            <span className="text-4xl font-pixel text-primary tracking-tight animate-bounce" style={{animationDelay: '0.1s'}}>3</span>
            <span className="text-4xl font-pixel text-magic tracking-tight animate-bounce" style={{animationDelay: '0.2s'}}>3</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {installPrompt && (
            <button 
              onClick={handleInstallClick}
              className="retro-btn bg-secondary text-bgPaper text-xs font-pixel uppercase px-3 py-1.5 border-2 border-bgDark shadow-[2px_2px_0_#292420] hover:bg-[#a06a35]"
            >
              Start Game
            </button>
          )}
          
          {loading && <div className="w-6 h-6 border-4 border-[#e8e4d3] border-t-primary rounded-none animate-spin"></div>}
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-xl mx-auto space-y-6">
        {view === ViewState.DASHBOARD && <DashboardView data={data} onNavigate={setView} />}
        {view === ViewState.CALCULATOR && <Calculator settings={settings} stock={data.estoque} onSaveSale={handleAddSale} />}
        {view === ViewState.INVENTORY && <InventoryView stock={data.estoque} onAddStock={handleAddStock} onUpdateStock={handleUpdateStock} onDeleteStock={handleDeleteStock} />}
        {view === ViewState.TRANSACTIONS && <TransactionsView sales={data.vendas} expenses={data.gastos} onUpdateSale={handleUpdateSale} onDeleteSale={handleDeleteSale} onAddExpense={handleAddExpense} onUpdateExpense={handleUpdateExpense} onDeleteExpense={handleDeleteExpense} />}
        {view === ViewState.SETTINGS && <SettingsView settings={settings} onSave={handleSaveSettings} apiUrl={apiUrl} onUrlChange={handleUrlChange} lastError={lastError} onRetry={fetchData} onMaintenance={handleMaintenance} />}
      </main>

      {/* RETRO NAV */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#e8e4d3] border-t-4 border-secondary pb-safe z-30 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around max-w-xl mx-auto pt-1 px-2">
          <NavButton v={ViewState.DASHBOARD} icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" className="transition-all"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>} label="Home" />
          <NavButton v={ViewState.CALCULATOR} icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" className="transition-all"><rect x="4" y="2" width="16" height="20" rx="2"/></svg>} label="Calc" />
          <NavButton v={ViewState.INVENTORY} icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" className="transition-all"><path d="M21 16V8l-7-4-7 4v8l7 4z"/></svg>} label="Items" />
          <NavButton v={ViewState.TRANSACTIONS} icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-all"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} label="Gold" />
          <NavButton v={ViewState.SETTINGS} icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" className="transition-all"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82"/></svg>} label="System" />
        </div>
      </nav>
      
      {toast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-bgDark text-accent px-6 py-3 border-2 border-accent shadow-retro z-50 animate-bounce flex items-center gap-3 font-pixel text-lg">
          <span className="text-xl">!</span> {toast}
        </div>
      )}
    </div>
  );
};

export default App;
