
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
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [apiUrl, setApiUrl] = useState<string>(() => {
    // @ts-ignore
    return localStorage.getItem('APPS_SCRIPT_URL') || window.APPS_SCRIPT_URL || "";
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then(() => setInstallPrompt(null));
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    const targetUrl = apiUrl ? apiUrl.trim() : '';
    if (!targetUrl) {
      setData(MOCK_DATA);
      return;
    }

    setLoading(true);
    try {
      const ts = new Date().getTime();
      const settingsRes = await fetch(`${targetUrl}?type=read_settings&t=${ts}`);
      if (settingsRes.ok) {
         const settingsJson = await settingsRes.json();
         setSettings({ ...DEFAULT_SETTINGS, ...settingsJson });
      }

      const dataRes = await fetch(`${targetUrl}?type=read_data&t=${ts}`);
      const dataJson = await dataRes.json();

      const fixItem = (item: any, prefix: string, idx: number) => {
         const id = (item.id && String(item.id).trim() !== "") ? String(item.id) : `${prefix}-${ts}-${idx}`;
         const safeNum = (val: any) => {
            let num = parseFloat(String(val).replace(',', '.'));
            return isNaN(num) ? 0 : num;
         };
         return {
            ...item, id, peso: safeNum(item.peso), preco: safeNum(item.preco), 
            venda: safeNum(item.venda), lucro: safeNum(item.lucro), valor: safeNum(item.valor)
         };
      };
      
      setData({ 
        estoque: (dataJson.estoque || []).map((item: any, i: number) => fixItem(item, 'st', i)),
        vendas: (dataJson.vendas || []).map((item: any, i: number) => fixItem(item, 've', i)),
        gastos: (dataJson.gastos || []).map((item: any, i: number) => fixItem(item, 'ga', i))
      });
      showToast('Dados sincronizados');
    } catch (err) {
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
      Object.keys(payload).forEach(key => formData.append(key, String(payload[key])));
      await fetch(apiUrl, { method: 'POST', body: formData });
    } catch(e) { showToast("Salvo localmente"); }
  };

  const handleSaveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    if (apiUrl) {
      setLoading(true);
      await apiCall({ type: 'save_settings', ...newSettings });
      setLoading(false);
      showToast('Configurações salvas');
    }
  };

  const NavButton = ({ v, icon: Icon, label }: { v: ViewState, icon: any, label: string }) => (
    <button onClick={() => setView(v)} className={`flex flex-col items-center justify-center w-full py-2 transition-all ${view === v ? 'text-amethyst-600 scale-105' : 'text-slate-400 opacity-60'}`}>
      <Icon active={view === v} />
      <span className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${view === v ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen pb-24 font-sans text-slate-800">
      <header className="sticky top-0 px-6 py-4 z-40 flex justify-between items-center bg-white/60 backdrop-blur-md border-b border-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 jewel-gradient-amethyst rounded-lg rotate-45 shadow-lg shadow-amethyst-500/20 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white/50 rounded-sm -rotate-45"></div>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amethyst-600 to-emerald-600">3D Jewelry</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {installPrompt && (
            <button onClick={handleInstallClick} className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-400/10 text-gold-500 border border-gold-400/20 shadow-inner">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3v14M5 10l7 7 7-7M2 21h20"/></svg>
            </button>
          )}
          {loading && <div className="w-4 h-4 border-2 border-slate-200 border-t-amethyst-500 rounded-full animate-spin"></div>}
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {view === ViewState.DASHBOARD && <DashboardView data={data} onNavigate={setView} />}
        {view === ViewState.CALCULATOR && <Calculator settings={settings} stock={data.estoque} onSaveSale={handleAddSale} />}
        {view === ViewState.INVENTORY && <InventoryView stock={data.estoque} onAddStock={handleAddStock} onUpdateStock={handleUpdateStock} onDeleteStock={handleDeleteStock} />}
        {view === ViewState.TRANSACTIONS && <TransactionsView sales={data.vendas} expenses={data.gastos} onUpdateSale={handleUpdateSale} onDeleteSale={handleDeleteSale} onAddExpense={handleAddExpense} onUpdateExpense={handleUpdateExpense} onDeleteExpense={handleDeleteExpense} />}
        {view === ViewState.SETTINGS && <SettingsView settings={settings} onSave={handleSaveSettings} apiUrl={apiUrl} onUrlChange={(val) => {setApiUrl(val); localStorage.setItem('APPS_SCRIPT_URL', val);}} onRetry={fetchData} />}
      </main>

      <nav className="fixed bottom-6 left-6 right-6 h-20 bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[32px] flex justify-around px-4 shadow-2xl z-50">
        <NavButton v={ViewState.DASHBOARD} icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>} label="Início" />
        <NavButton v={ViewState.CALCULATOR} icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/></svg>} label="Calc" />
        <NavButton v={ViewState.INVENTORY} icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M21 16V8l-7-4-7 4v8l7 4z"/></svg>} label="Gemas" />
        <NavButton v={ViewState.TRANSACTIONS} icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} label="Ouro" />
        <NavButton v={ViewState.SETTINGS} icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82"/></svg>} label="Menu" />
      </nav>
      
      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-6 py-2 rounded-full text-xs font-bold z-[60] backdrop-blur-md animate-bounce">
          {toast}
        </div>
      )}
    </div>
  );

  // Reutilizando handlers anteriores (simplificados para brevidade no prompt, mas mantendo lógica)
  async function handleAddStock(n:any, m:any, p:any, pr:any, c:any, t:any) {
    const item = { id: "ST"+Date.now(), nome:n, marca:m, peso:p, preco:pr, cor:c, tipo:t };
    setData(prev => ({ ...prev, estoque: [...prev.estoque, item] }));
    await apiCall({ type: 'estoque', action: 'create', ...item });
  }
  async function handleUpdateStock(id:string, up:any) {
    setData(prev => ({ ...prev, estoque: prev.estoque.map(i => i.id === id ? {...i, ...up} : i) }));
    await apiCall({ type: 'estoque', action: 'update', id, ...up });
  }
  async function handleDeleteStock(id:string) {
    if(!confirm("Remover gema?")) return;
    setData(prev => ({ ...prev, estoque: prev.estoque.filter(i => i.id !== id) }));
    await apiCall({ type: 'estoque', action: 'delete', id });
  }
  async function handleAddSale(it:any, mat:any, pes:any, ven:any, luc:any, sid?:any) {
    const s = { id: "VE"+Date.now(), data: new Date().toISOString().split('T')[0], item:it, material:mat, peso:pes, venda:ven, lucro:luc };
    setData(prev => ({ ...prev, vendas: [s, ...prev.vendas] }));
    if(sid) {
      const st = data.estoque.find(x => x.id === sid);
      if(st) handleUpdateStock(sid, { peso: st.peso - pes });
    }
    await apiCall({ type: 'venda', action: 'create', ...s });
    setView(ViewState.TRANSACTIONS);
  }
  async function handleUpdateSale(id:string, v:any, l:any) {
    setData(prev => ({ ...prev, vendas: prev.vendas.map(s => s.id === id ? {...s, venda:v, lucro:l} : s) }));
    await apiCall({ type: 'venda', action: 'update', id, venda:v, lucro:l });
  }
  async function handleDeleteSale(id:string) {
    setData(prev => ({ ...prev, vendas: prev.vendas.filter(s => s.id !== id) }));
    await apiCall({ type: 'venda', action: 'delete', id });
  }
  async function handleAddExpense(d:any, v:any, dt:any) {
    const g = { id: "GA"+Date.now(), descricao:d, valor:v, data:dt };
    setData(prev => ({ ...prev, gastos: [g, ...prev.gastos] }));
    await apiCall({ type: 'gasto', action: 'create', ...g });
  }
  async function handleUpdateExpense(id:string, d:any, v:any) {
    setData(prev => ({ ...prev, gastos: prev.gastos.map(g => g.id === id ? {...g, descricao:d, valor:v} : g) }));
    await apiCall({ type: 'gasto', action: 'update', id, descricao:d, valor:v });
  }
  async function handleDeleteExpense(id:string) {
    setData(prev => ({ ...prev, gastos: prev.gastos.filter(g => g.id !== id) }));
    await apiCall({ type: 'gasto', action: 'delete', id });
  }
};

export default App;
