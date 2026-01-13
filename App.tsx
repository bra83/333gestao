
import React, { useState, useEffect, useCallback } from 'react';
import { Settings, AppData, ViewState, StockItem } from './types';
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
  const [apiUrl, setApiUrl] = useState<string>(() => localStorage.getItem('APPS_SCRIPT_URL') || (window as any).APPS_SCRIPT_URL || "");
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
      const [settingsRes, dataRes] = await Promise.all([
        fetch(`${targetUrl}?type=read_settings&t=${ts}`),
        fetch(`${targetUrl}?type=read_data&t=${ts}`)
      ]);
      
      if (settingsRes.ok) setSettings({ ...DEFAULT_SETTINGS, ...await settingsRes.json() });
      if (dataRes.ok) {
        const dataJson = await dataRes.json();
        const fixItem = (item: any, prefix: string, idx: number) => {
          const safeNum = (val: any) => {
            let num = parseFloat(String(val).replace(',', '.'));
            return isNaN(num) ? 0 : num;
          };
          return {
            ...item, 
            id: item.id || `${prefix}-${ts}-${idx}`,
            peso: safeNum(item.peso), 
            preco: safeNum(item.preco), 
            venda: safeNum(item.venda), 
            lucro: safeNum(item.lucro), 
            valor: safeNum(item.valor)
          };
        };
        setData({ 
          estoque: (dataJson.estoque || []).map((i: any, idx: number) => fixItem(i, 'st', idx)),
          vendas: (dataJson.vendas || []).map((i: any, idx: number) => fixItem(i, 've', idx)),
          gastos: (dataJson.gastos || []).map((i: any, idx: number) => fixItem(i, 'ga', idx))
        });
      }
    } catch (err) {
      if (data.estoque.length === 0) setData(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, data.estoque.length]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const apiCall = async (payload: any) => {
    if(!apiUrl) return;
    try {
      const formData = new FormData();
      Object.keys(payload).forEach(key => formData.append(key, String(payload[key])));
      await fetch(apiUrl, { method: 'POST', body: formData });
    } catch(e) { showToast("Sincronização offline"); }
  };

  // Handlers
  const handleAddStock = async (n:any, m:any, p:any, pr:any, c:any, t:any) => {
    const item = { id: "ST"+Date.now(), nome:n, marca:m, peso:p, preco:pr, cor:c, tipo:t };
    setData(prev => ({ ...prev, estoque: [...prev.estoque, item] }));
    await apiCall({ type: 'estoque', action: 'create', ...item });
    showToast("Gema lapidada!");
  };

  const handleUpdateStock = async (id:string, up:any) => {
    setData(prev => ({ ...prev, estoque: prev.estoque.map(i => i.id === id ? {...i, ...up} : i) }));
    await apiCall({ type: 'estoque', action: 'update', id, ...up });
  };

  const handleDeleteStock = async (id:string) => {
    if(!confirm("Remover gema do cofre?")) return;
    setData(prev => ({ ...prev, estoque: prev.estoque.filter(i => i.id !== id) }));
    await apiCall({ type: 'estoque', action: 'delete', id });
    showToast("Gema removida");
  };

  const handleAddSale = async (it:any, mat:any, pes:any, ven:any, luc:any, sid?:any) => {
    const s = { id: "VE"+Date.now(), data: new Date().toISOString().split('T')[0], item:it, material:mat, peso:pes, venda:ven, lucro:luc };
    setData(prev => ({ ...prev, vendas: [s, ...prev.vendas] }));
    if(sid) {
      const st = data.estoque.find(x => x.id === sid);
      if(st) handleUpdateStock(sid, { peso: st.peso - pes });
    }
    await apiCall({ type: 'venda', action: 'create', ...s });
    setView(ViewState.TRANSACTIONS);
    showToast("Venda concluída!");
  };

  const NavButton = ({ v, icon: Icon, label, colorClass }: { v: ViewState, icon: any, label: string, colorClass: string }) => (
    <button onClick={() => setView(v)} className={`flex flex-col items-center justify-center w-full py-2 transition-all duration-300 ${view === v ? `${colorClass} scale-110` : 'text-slate-300 opacity-50'}`}>
      <Icon active={view === v} />
      <span className={`text-[9px] font-black mt-1 uppercase tracking-tighter transition-opacity ${view === v ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen pb-32 font-sans text-slate-800">
      <header className="sticky top-0 px-6 py-4 z-40 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 jewel-gradient-amethyst rounded-xl rotate-12 shadow-xl shadow-amethyst-500/20 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white/50 rounded-sm -rotate-12"></div>
          </div>
          <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-amethyst-600 via-sapphire-500 to-emerald-600">3D JEWELRY</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {installPrompt && (
            <button onClick={handleInstallClick} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gold-400 text-white shadow-lg shadow-gold-400/30 animate-pulse">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 3v14M5 10l7 7 7-7M2 21h20"/></svg>
            </button>
          )}
          {loading && <div className="w-5 h-5 border-3 border-slate-100 border-t-amethyst-500 rounded-full animate-spin"></div>}
        </div>
      </header>

      <main className="p-5 max-w-2xl mx-auto">
        {view === ViewState.DASHBOARD && <DashboardView data={data} onNavigate={setView} />}
        {view === ViewState.CALCULATOR && <Calculator settings={settings} stock={data.estoque} onSaveSale={handleAddSale} />}
        {view === ViewState.INVENTORY && <InventoryView stock={data.estoque} onAddStock={handleAddStock} onUpdateStock={handleUpdateStock} onDeleteStock={handleDeleteStock} />}
        {view === ViewState.TRANSACTIONS && <TransactionsView sales={data.vendas} expenses={data.gastos} onUpdateSale={(id, v, l) => {
            setData(prev => ({ ...prev, vendas: prev.vendas.map(s => s.id === id ? {...s, venda:v, lucro:l} : s) }));
            apiCall({ type: 'venda', action: 'update', id, venda:v, lucro:l });
          }} onDeleteSale={(id) => {
            setData(prev => ({ ...prev, vendas: prev.vendas.filter(s => s.id !== id) }));
            apiCall({ type: 'venda', action: 'delete', id });
          }} onAddExpense={async (d, v, dt) => {
            const g = { id: "GA"+Date.now(), descricao:d, valor:v, data:dt };
            setData(prev => ({ ...prev, gastos: [g, ...prev.gastos] }));
            await apiCall({ type: 'gasto', action: 'create', ...g });
          }} onUpdateExpense={async (id, d, v) => {
            setData(prev => ({ ...prev, gastos: prev.gastos.map(g => g.id === id ? {...g, descricao:d, valor:v} : g) }));
            await apiCall({ type: 'gasto', action: 'update', id, descricao:d, valor:v });
          }} onDeleteExpense={async (id) => {
            setData(prev => ({ ...prev, gastos: prev.gastos.filter(g => g.id !== id) }));
            await apiCall({ type: 'gasto', action: 'delete', id });
          }} />}
        {view === ViewState.SETTINGS && <SettingsView settings={settings} onSave={async (s) => {
            setSettings(s);
            await apiCall({ type: 'save_settings', ...s });
            showToast("Configurações salvas");
          }} apiUrl={apiUrl} onUrlChange={(val) => {setApiUrl(val); localStorage.setItem('APPS_SCRIPT_URL', val);}} onRetry={fetchData} />}
      </main>

      <nav className="fixed bottom-8 left-6 right-6 h-20 bg-white/90 backdrop-blur-2xl border border-white/40 rounded-[35px] flex justify-around px-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50">
        <NavButton v={ViewState.DASHBOARD} colorClass="text-sapphire-500" icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>} label="Painel" />
        <NavButton v={ViewState.CALCULATOR} colorClass="text-gold-500" icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><rect x="4" y="2" width="16" height="20" rx="2"/></svg>} label="Calc" />
        <NavButton v={ViewState.INVENTORY} colorClass="text-emerald-500" icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8l-7-4-7 4v8l7 4z"/></svg>} label="Gemas" />
        <NavButton v={ViewState.TRANSACTIONS} colorClass="text-rose-500" icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} label="Ouro" />
        <NavButton v={ViewState.SETTINGS} colorClass="text-amethyst-500" icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82"/></svg>} label="Ajustes" />
      </nav>
      
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-6 py-3 rounded-2xl text-xs font-black z-[60] backdrop-blur-md shadow-2xl animate-bounce tracking-widest uppercase">
          {toast}
        </div>
      )}
    </div>
  );
};

export default App;
