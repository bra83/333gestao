
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
            cor: i.cor || i.Cor || "#3b82f6",
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
      showToast("Erro ao sincronizar com a nuvem");
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
    } catch (e) { 
      return false;
    }
  };

  const handleAddStock = async (n: string, m: string, p: number, pr: number, c: string, t: string) => {
    const item: StockItem = { id: "ST" + Date.now(), nome: n, marca: m, peso: p, preco: pr, cor: c, tipo: t };
    setData(prev => ({ ...prev, estoque: [...prev.estoque, item] }));
    const ok = await apiCall({ type: 'estoque', action: 'create', ...item });
    if(ok) showToast("Gema guardada no cofre!");
  };

  const handleUpdateStock = async (id: string, updates: Partial<StockItem>) => {
    const currentItem = data.estoque.find(i => i.id === id);
    if (!currentItem) return;
    const updatedItem = { ...currentItem, ...updates };
    setData(prev => ({ ...prev, estoque: prev.estoque.map(i => i.id === id ? updatedItem : i) }));
    await apiCall({ type: 'estoque', action: 'update', ...updatedItem });
  };

  const handleDeleteStock = async (id: string) => {
    if (!confirm("Remover permanentemente?")) return;
    setData(prev => ({ ...prev, estoque: prev.estoque.filter(i => i.id !== id) }));
    await apiCall({ type: 'estoque', action: 'delete', id });
  };

  const NavButton = ({ v, icon: Icon, label, color }: { v: ViewState, icon: any, label: string, color: string }) => (
    <button onClick={() => setView(v)} className={`flex flex-col items-center justify-center w-full py-2 transition-all duration-300 ${view === v ? 'scale-110' : 'opacity-40 grayscale'}`} style={{ color: view === v ? color : '#94a3b8' }}>
      <Icon active={view === v} />
      <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen pb-32 bg-[#fdfcfd]">
      <header className="sticky top-0 px-6 py-5 z-40 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 jewel-gradient-amethyst rounded-xl rotate-12 shadow-xl flex items-center justify-center overflow-hidden">
             <img src="https://raw.githubusercontent.com/bra83/333gestao/main/logomarca.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-amethyst-600 via-sapphire-500 to-emerald-600 uppercase">SAVEPOINT QUEST</h1>
        </div>
        <button onClick={fetchData} className={`p-2 rounded-full transition-all ${loading ? 'animate-spin text-amethyst-500' : 'active:scale-90 text-slate-400'}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
        </button>
      </header>

      <main className="p-5 max-w-2xl mx-auto">
        {apiUrl === "" && view !== ViewState.SETTINGS && (
          <div className="jewelry-card p-8 text-center animate-pulse border-2 border-dashed border-amethyst-200">
            <h2 className="font-black text-amethyst-600 uppercase mb-2">Conexão Necessária</h2>
            <p className="text-xs font-bold text-slate-400 mb-6">Configure o link do seu Google Sheets para começar a minerar dados.</p>
            <button onClick={() => setView(ViewState.SETTINGS)} className="jewel-gradient-amethyst text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest">Configurar Agora</button>
          </div>
        )}

        {view === ViewState.DASHBOARD && <DashboardView data={data} onNavigate={setView} />}
        {view === ViewState.CALCULATOR && <Calculator settings={settings} stock={data.estoque} onSaveSale={async (it, mats, ven, luc) => {
          const totalWeight = mats.reduce((acc, m) => acc + m.weight, 0);
          const materialList = mats.map(m => `${m.weight}g ${m.name}`).join(", ");
          
          const s = { 
            id: "VE" + Date.now(), 
            data: new Date().toISOString().split('T')[0], 
            item: it, 
            material: materialList, 
            peso: totalWeight, 
            venda: ven, 
            lucro: luc 
          };
          
          setData(prev => ({ ...prev, vendas: [s, ...prev.vendas] }));
          
          // Desconta cada filamento individualmente do estoque
          for (const m of mats) {
            const st = data.estoque.find(x => x.id === m.stockId);
            if (st) {
              await handleUpdateStock(m.stockId, { peso: st.peso - m.weight });
            }
          }
          
          await apiCall({ type: 'venda', action: 'create', ...s });
          setView(ViewState.TRANSACTIONS);
          showToast("Venda registrada!");
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
        {view === ViewState.SETTINGS && <SettingsView settings={settings} onSave={async (s) => {
          setSettings(s); await apiCall({ type: 'save_settings', ...s }); showToast("Ajustes Salvos");
        }} apiUrl={apiUrl} onUrlChange={(val) => { setApiUrl(val); localStorage.setItem('APPS_SCRIPT_URL', val); }} onRetry={fetchData} />}
      </main>

      <nav className="fixed bottom-8 left-6 right-6 h-20 bg-white/90 backdrop-blur-2xl border border-white/40 rounded-[35px] flex justify-around px-4 shadow-2xl z-50">
        <NavButton v={ViewState.DASHBOARD} color="#3b82f6" icon={({ active }: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>} label="Painel" />
        <NavButton v={ViewState.CALCULATOR} color="#fbbf24" icon={({ active }: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><rect x="4" y="2" width="16" height="20" rx="2"/></svg>} label="Calc" />
        <NavButton v={ViewState.INVENTORY} color="#10b981" icon={({ active }: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8l-7-4-7 4v8l7 4z"/></svg>} label="Gemas" />
        <NavButton v={ViewState.TRANSACTIONS} color="#f43f5e" icon={({ active }: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} label="Ouro" />
        <NavButton v={ViewState.SETTINGS} color="#a855f7" icon={({ active }: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82"/></svg>} label="Ajustes" />
      </nav>

      {toast && <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black z-[60] shadow-2xl animate-bounce tracking-widest uppercase">{toast}</div>}
    </div>
  );
};

export default App;
