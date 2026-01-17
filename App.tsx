
import React, { useState, useEffect, useCallback } from 'react';
import { Settings, AppData, ViewState, StockItem } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { Calculator } from './components/Calculator';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { SettingsView } from './components/SettingsView';
import { TransactionsView } from './components/TransactionsView';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [data, setData] = useState<AppData>({ estoque: [], vendas: [], gastos: [] });
  const [apiUrl, setApiUrl] = useState<string>(() => localStorage.getItem('APPS_SCRIPT_URL') || (window as any).APPS_SCRIPT_URL || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const parseRemoteNumber = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const clean = String(val).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const fetchData = useCallback(async () => {
    if (!apiUrl) return;
    setLoading(true);
    try {
      const ts = new Date().getTime();
      const [sRes, dRes] = await Promise.all([
        fetch(`${apiUrl}?type=read_settings&nocache=${ts}`),
        fetch(`${apiUrl}?type=read_data&nocache=${ts}`)
      ]);
      
      if (sRes.ok) {
        const sJson = await sRes.json();
        setSettings({ ...DEFAULT_SETTINGS, ...sJson });
      }
      
      if (dRes.ok) {
        const d = await dRes.json();
        setData({
          estoque: (d.estoque || []).map((i: any) => ({ 
            id: i.id || i.ID || String(Math.random()),
            nome: i.nome || i.Nome || "", 
            marca: i.marca || i.Marca || "",
            peso: parseRemoteNumber(i.peso || i.Peso), 
            preco: parseRemoteNumber(i.preco || i.Preco),
            cor: i.cor || i.Cor || "#ffb642",
            tipo: i.tipo || i.Tipo || "PLA"
          })),
          vendas: (d.vendas || []).map((i: any) => ({ 
            ...i, 
            venda: parseRemoteNumber(i.venda || i.Venda), 
            lucro: parseRemoteNumber(i.lucro || i.Lucro) 
          })),
          gastos: (d.gastos || []).map((i: any) => ({ 
            ...i, 
            valor: parseRemoteNumber(i.valor || i.Valor) 
          }))
        });
      }
    } catch (e) { 
      showToast("ERRO DE CONEXÃO COM O VAULT");
    } finally { 
      setLoading(false); 
    }
  }, [apiUrl]);

  useEffect(() => { 
    if (apiUrl) fetchData(); 
  }, [fetchData, apiUrl]);

  const apiCall = async (payload: any) => {
    if (!apiUrl) return false;
    const formData = new FormData();
    Object.keys(payload).forEach(k => {
      const val = payload[k] === undefined || payload[k] === null ? "" : String(payload[k]);
      formData.append(k, val);
    });
    try { 
      const res = await fetch(apiUrl, { method: 'POST', body: formData });
      return res.ok;
    } catch (e) { return false; }
  };

  const handleAddStock = async (n: string, m: string, p: number, pr: number, c: string, t: string) => {
    const item: StockItem = { id: "ST" + Date.now(), nome: n, marca: m, peso: p, preco: pr, cor: c, tipo: t };
    setData(prev => ({ ...prev, estoque: [...prev.estoque, item] }));
    await apiCall({ type: 'estoque', action: 'create', ...item });
    showToast("ITEM REGISTRADO NO INVENTÁRIO");
  };

  const handleUpdateStock = async (id: string, updates: Partial<StockItem>) => {
    const currentItem = data.estoque.find(i => i.id === id);
    if (!currentItem) return;
    const updatedItem = { ...currentItem, ...updates };
    setData(prev => ({ ...prev, estoque: prev.estoque.map(i => i.id === id ? updatedItem : i) }));
    await apiCall({ type: 'estoque', action: 'update', ...updatedItem });
  };

  const handleDeleteStock = async (id: string) => {
    if (!confirm("DESEJA DELETAR ESTE REGISTRO?")) return;
    setData(prev => ({ ...prev, estoque: prev.estoque.filter(i => i.id !== id) }));
    await apiCall({ type: 'estoque', action: 'delete', id });
  };

  const NavButton = ({ v, icon: Icon, label }: { v: ViewState, icon: any, label: string }) => (
    <button 
      onClick={() => setView(v)} 
      className={`flex flex-col items-center justify-center w-full h-full transition-all border-b-4 ${view === v ? 'border-vault-amber bg-vault-amber/10' : 'border-transparent opacity-50 grayscale'}`}
    >
      <Icon active={view === v} />
      <span className="text-[10px] font-bold mt-1 uppercase glow-text">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen pb-24">
      <header className="px-6 py-4 flex justify-between items-center bg-vault-panel border-b-2 border-vault-amber shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 border-2 border-vault-amber p-1 bg-black">
             <img src="https://raw.githubusercontent.com/bra83/333gestao/main/logomarca.png" alt="Logo" className="w-full h-full object-contain brightness-125 contrast-125" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-widest text-vault-amber glow-text leading-none uppercase">SAVEPOINT QUEST</h1>
            <p className="text-[9px] text-vault-amber opacity-70 font-bold uppercase tracking-tighter">Vault-Tec OS v18.0.4</p>
          </div>
        </div>
        <button onClick={fetchData} className={`p-2 border-2 border-vault-amber rounded ${loading ? 'animate-spin bg-vault-amber text-black' : 'active:scale-95 text-vault-amber'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
        </button>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {apiUrl === "" && view !== ViewState.SETTINGS && (
          <div className="jewelry-card p-8 text-center border-dashed">
            <h2 className="font-black text-vault-amber uppercase mb-2 glow-text">TERMINAL BLOQUEADO</h2>
            <p className="text-[10px] font-bold text-vault-amber/60 mb-6 uppercase">Insira a URL do Mainframe para sincronizar dados.</p>
            <button onClick={() => setView(ViewState.SETTINGS)} className="bg-vault-amber text-black px-8 py-3 font-black text-xs uppercase tracking-widest hover:bg-white transition-colors">Acessar Terminal</button>
          </div>
        )}

        {view === ViewState.DASHBOARD && <DashboardView data={data} onNavigate={setView} />}
        {view === ViewState.CALCULATOR && <Calculator settings={settings} stock={data.estoque} onSaveSale={async (it, mats, ven, luc) => {
          const s = { 
            id: "VE" + Date.now(), 
            data: new Date().toISOString().split('T')[0], 
            item: it, 
            material: mats.map(m => `${m.weight}g ${m.name}`).join(", "), 
            peso: mats.reduce((acc, m) => acc + m.weight, 0), 
            venda: ven, 
            lucro: luc 
          };
          setData(prev => ({ ...prev, vendas: [s, ...prev.vendas] }));
          for (const m of mats) {
            const st = data.estoque.find(x => x.id === m.stockId);
            if (st) await handleUpdateStock(m.stockId, { peso: st.peso - m.weight });
          }
          await apiCall({ type: 'venda', action: 'create', ...s });
          setView(ViewState.TRANSACTIONS);
          showToast("DADOS TRANSMITIDOS");
        }} />}
        {view === ViewState.INVENTORY && <InventoryView stock={data.estoque} onAddStock={handleAddStock} onUpdateStock={handleUpdateStock} onDeleteStock={handleDeleteStock} />}
        {view === ViewState.TRANSACTIONS && <TransactionsView sales={data.vendas} expenses={data.gastos} onUpdateSale={(id, v, l) => {
          setData(prev => ({ ...prev, vendas: prev.vendas.map(s => s.id === id ? { ...s, venda: v, lucro: l } : s) }));
          apiCall({ type: 'venda', action: 'update', id, venda: v, lucro: l });
        }} onDeleteSale={(id) => {
          setData(prev => ({ ...prev, vendas: prev.vendas.filter(s => s.id !== id) }));
          apiCall({ type: 'venda', action: 'delete', id });
        }} onAddExpense={async (d, v, dt) => {
          const g = { id: "GA" + Date.now(), descricao: d, valor: v, data: dt };
          setData(prev => ({ ...prev, gastos: [g, ...prev.gastos] }));
          await apiCall({ type: 'gasto', action: 'create', ...g });
        }} onUpdateExpense={async (id, d, v) => {
          setData(prev => ({ ...prev, gastos: prev.gastos.map(g => g.id === id ? { ...g, descricao: d, valor: v } : g) }));
          await apiCall({ type: 'gasto', action: 'update', id, descricao: d, valor: v });
        }} onDeleteExpense={async (id) => {
          setData(prev => ({ ...prev, gastos: prev.gastos.filter(g => g.id !== id) }));
          await apiCall({ type: 'gasto', action: 'delete', id });
        }} />}
        {view === ViewState.SETTINGS && (
          <SettingsView 
            settings={settings} 
            onSave={async (s) => {
              setSettings(s); await apiCall({ type: 'save_settings', ...s }); showToast("CONFIGURAÇÕES SALVAS");
            }} 
            apiUrl={apiUrl} 
            onUrlChange={(val) => { setApiUrl(val); localStorage.setItem('APPS_SCRIPT_URL', val); }} 
            onRetry={fetchData}
            canInstall={!!deferredPrompt}
            onInstall={handleInstallApp}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-vault-panel border-t-2 border-vault-amber flex justify-around z-50">
        <NavButton v={ViewState.DASHBOARD} icon={({ active }: any) => <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>} label="Painel" />
        <NavButton v={ViewState.CALCULATOR} icon={({ active }: any) => <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><rect x="4" y="2" width="16" height="20" rx="2"/></svg>} label="Cálculo" />
        <NavButton v={ViewState.INVENTORY} icon={({ active }: any) => <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8l-7-4-7 4v8l7 4z"/></svg>} label="Inv." />
        <NavButton v={ViewState.TRANSACTIONS} icon={({ active }: any) => <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} label="Caps" />
        <NavButton v={ViewState.SETTINGS} icon={({ active }: any) => <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82"/></svg>} label="Conf." />
      </nav>

      {toast && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-vault-amber text-black px-4 py-2 font-black z-[60] text-[10px] tracking-widest uppercase border-2 border-black">{toast}</div>}
    </div>
  );
};

export default App;
