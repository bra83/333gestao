
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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
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
            id: i.id || i.ID,
            nome: i.nome || i.Nome, 
            marca: i.marca || i.Marca,
            peso: Number(i.peso || 0), 
            preco: Number(i.preco || 0),
            cor: i.cor || "#ffb642",
            tipo: i.tipo || "PLA"
          })),
          vendas: (d.vendas || []).map((i: any) => ({ ...i, venda: Number(i.venda), lucro: Number(i.lucro) })),
          gastos: (d.gastos || []).map((i: any) => ({ ...i, valor: Number(i.valor) }))
        });
      }
    } catch (e) { 
      showToast("ERRO DE CONEXÃƒO COM O VAULT");
    } finally { setLoading(false); }
  }, [apiUrl]);

  useEffect(() => { if (apiUrl) fetchData(); }, [fetchData, apiUrl]);

  const apiCall = async (payload: any) => {
    if (!apiUrl) return false;
    const formData = new FormData();
    Object.keys(payload).forEach(k => formData.append(k, String(payload[k] || "")));
    try { 
      const res = await fetch(apiUrl, { method: 'POST', body: formData });
      return res.ok;
    } catch (e) { return false; }
  };

  const NavButton = ({ v, icon: Icon, label }: { v: ViewState, icon: any, label: string }) => (
    <button 
      onClick={() => setView(v)} 
      className={`flex flex-col items-center justify-center w-full h-full transition-all border-t-4 ${view === v ? 'border-vault-amber bg-vault-amber/10' : 'border-transparent opacity-40 grayscale'}`}
    >
      <Icon active={view === v} />
      <span className="text-[10px] font-bold mt-1 uppercase glow-text">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-vault-bg text-vault-amber">
      <header className="px-6 py-4 flex justify-between items-center bg-vault-panel border-b-2 border-vault-amber sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-4">
          <img 
            src="https://raw.githubusercontent.com/bra83/333gestao/main/logomarca.png" 
            alt="Logo" 
            className="w-20 h-20 object-contain logo-vault" 
          />
          <div>
            <h1 className="text-xl font-black tracking-[.2em] text-vault-amber glow-text leading-none uppercase">SAVEPOINT</h1>
            <p className="text-[9px] opacity-60 font-bold uppercase mt-1">Vault-Tec OS v18.0.6</p>
          </div>
        </div>
        <button onClick={fetchData} className={`p-3 border-2 border-vault-amber ${loading ? 'animate-spin bg-vault-amber text-black' : 'active:scale-95 text-vault-amber'}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
        </button>
      </header>

      <main className="p-4 max-w-2xl mx-auto main-content">
        {view === ViewState.DASHBOARD && <DashboardView data={data} onNavigate={setView} />}
        {view === ViewState.CALCULATOR && <Calculator settings={settings} stock={data.estoque} onSaveSale={async (it, mats, ven, luc) => {
           const s = { id: "VE"+Date.now(), data: new Date().toISOString().split('T')[0], item: it, material: mats.map(m=>m.name).join(", "), peso: mats.reduce((a,b)=>a+b.weight,0), venda: ven, lucro: luc };
           setData(p=>({...p, vendas: [s, ...p.vendas]}));
           await apiCall({ type: 'venda', action: 'create', ...s });
           setView(ViewState.TRANSACTIONS);
           showToast("TRANSMISSÃƒO OK");
        }} />}
        {view === ViewState.INVENTORY && <InventoryView stock={data.estoque} onAddStock={async (n,m,p,pr,c,t)=>{
           const i = { id: "ST"+Date.now(), nome: n, marca: m, peso: p, preco: pr, cor: c, tipo: t };
           setData(prev=>({...prev, estoque: [...prev.estoque, i]}));
           await apiCall({ type: 'estoque', action: 'create', ...i });
        }} onUpdateStock={async (id, up)=>{
           setData(prev=>({...prev, estoque: prev.estoque.map(i=>i.id===id?{...i,...up}:i)}));
           const item = data.estoque.find(x=>x.id===id);
           await apiCall({ type: 'estoque', action: 'update', id, ...item, ...up });
        }} onDeleteStock={async (id)=>{
           if(!confirm("DELETAR HOLOTAPE?")) return;
           setData(prev=>({...prev, estoque: prev.estoque.filter(i=>i.id!==id)}));
           await apiCall({ type: 'estoque', action: 'delete', id });
        }} />}
        {view === ViewState.TRANSACTIONS && <TransactionsView sales={data.vendas} expenses={data.gastos} onUpdateSale={()=>{}} onDeleteSale={async (id)=>{
           setData(p=>({...p, vendas: p.vendas.filter(v=>v.id!==id)}));
           await apiCall({ type: 'venda', action: 'delete', id });
        }} onAddExpense={async (d,v,dt)=>{
           const g = { id: "GA"+Date.now(), descricao: d, valor: v, data: dt };
           setData(p=>({...p, gastos: [g, ...p.gastos]}));
           await apiCall({ type: 'gasto', action: 'create', ...g });
        }} onUpdateExpense={()=>{}} onDeleteExpense={async (id)=>{
           setData(p=>({...p, gastos: p.gastos.filter(g=>g.id!==id)}));
           await apiCall({ type: 'gasto', action: 'delete', id });
        }} />}
        {view === ViewState.SETTINGS && (
          <SettingsView 
            settings={settings} onSave={async (s)=>{setSettings(s); await apiCall({type:'save_settings', ...s}); showToast("OS ATUALIZADO");}}
            apiUrl={apiUrl} onUrlChange={(v)=>{setApiUrl(v); localStorage.setItem('APPS_SCRIPT_URL',v);}}
            onRetry={fetchData}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-vault-panel border-t-2 border-vault-amber flex justify-around items-stretch z-[60] pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.8)]">
        <NavButton v={ViewState.DASHBOARD} icon={({ active }: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>} label="STATUS" />
        <NavButton v={ViewState.CALCULATOR} icon={({ active }: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><rect x="4" y="2" width="16" height="20" rx="2"/></svg>} label="FABRIC" />
        <NavButton v={ViewState.INVENTORY} icon={({ active }: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8l-7-4-7 4v8l7 4z"/></svg>} label="DATA" />
        <NavButton v={ViewState.TRANSACTIONS} icon={({ active }: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} label="CAPS" />
        <NavButton v={ViewState.SETTINGS} icon={({ active }: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82"/></svg>} label="SETUP" />
      </nav>

      {toast && <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-vault-amber text-black px-6 py-2 font-black z-[100] text-xs tracking-widest uppercase border-4 border-black shadow-2xl">{toast}</div>}
    </div>
  );
};

export default App;
