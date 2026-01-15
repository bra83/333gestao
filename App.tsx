
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
          <div className="w-10 h-10 jewel-gradient-amethyst rounded-xl rotate-12 shadow-xl flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-amethyst-600 via-sapphire-500 to-emerald-600">3D JEWELRY</h1>
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
          // mats: {name, weight, stockId}[]
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
      
      if (settingsRes.ok) {
         const settingsJson = await settingsRes.json();
         // Parse numbers explicitly to avoid string concatenation issues that crash Calculator
         const safeSettings = { ...DEFAULT_SETTINGS };
         Object.keys(settingsJson).forEach(key => {
            const val = settingsJson[key];
            // @ts-ignore
            if (typeof DEFAULT_SETTINGS[key] === 'number') {
               const num = Number(val);
               // @ts-ignore
               safeSettings[key] = isNaN(num) ? DEFAULT_SETTINGS[key] : num;
            } else {
               // @ts-ignore
               safeSettings[key] = val;
            }
         });

         if (safeSettings.vidaUtilHoras < 100) safeSettings.vidaUtilHoras = 8000;
         if (safeSettings.horasTrab < 1) safeSettings.horasTrab = 160;
         if (safeSettings.eficienciaFonte <= 0) safeSettings.eficienciaFonte = 0.9;
         setSettings(safeSettings);
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
            // Sanity check for massive numbers from bad parsing
            while (Math.abs(num) > 200000) {
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

  // Helper para gerar ID único evitando colisoes que causam bugs na lista
  const genId = (prefix: string) => `${prefix}${Date.now()}${Math.floor(Math.random() * 999)}`;

  const handleAddStock = async (nome: string, marca: string, peso: number, preco: number, cor: string, tipo: string) => {
    const id = genId("ST");
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
    const id = genId("VE");
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
    const id = genId("GA");
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

  // NavButton atualizado para suportar cores Jewelery
  const NavButton = ({ v, icon: Icon, label, activeColor, hoverColor }: { v: ViewState, icon: any, label: string, activeColor: string, hoverColor: string }) => {
    const isActive = view === v;
    return (
      <button 
        onClick={() => setView(v)} 
        className={`group flex flex-col items-center justify-center w-full py-2 transition-all duration-300 ${isActive ? activeColor : 'text-slate-400 ' + hoverColor}`}
      >
        <div className={`p-1.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white shadow-sm -translate-y-2 scale-110 ring-1 ring-slate-100' : 'group-hover:-translate-y-1 group-hover:bg-slate-50'}`}>
          <Icon active={isActive} />
        </div>
        <span className={`text-[10px] font-bold mt-1 transition-all ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-bgBody text-textMain font-sans selection:bg-accent/20 selection:text-accent">
      
      {/* HEADER MODERNO COM LOGO AUMENTADA */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 z-40 flex justify-between items-center h-20">
        <div className="flex items-center">
          <div className="relative group">
            {/* LOGO DO GITHUB DO USUÁRIO AUMENTADA */}
            <img 
              src="https://raw.githubusercontent.com/bra83/333gestao/main/icon-512.png" 
              alt="Logo" 
              className="w-16 h-16 rounded-2xl shadow-sm group-hover:scale-105 transition-transform duration-300"
            />
          </div>
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

      {/* MODERN NAV JEWELERY COLORS */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-200 pb-safe z-30 shadow-nav">
        <div className="flex justify-around max-w-xl mx-auto pt-2 px-2">
          
          {/* DIAMOND (CYAN) */}
          <NavButton 
            v={ViewState.DASHBOARD} 
            activeColor="text-cyan-500" 
            hoverColor="hover:text-cyan-500"
            icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="transition-all"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>} 
            label="Início" 
          />
          
          {/* TOPAZ (AMBER/GOLD) */}
          <NavButton 
            v={ViewState.CALCULATOR} 
            activeColor="text-amber-500" 
            hoverColor="hover:text-amber-500"
            icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="transition-all"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/><line x1="8" y1="18" x2="8" y2="18"/><line x1="16" y1="18" x2="16" y2="18"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/></svg>} 
            label="Calc" 
          />
          
          {/* EMERALD (GREEN) */}
          <NavButton 
            v={ViewState.INVENTORY} 
            activeColor="text-emerald-500" 
            hoverColor="hover:text-emerald-500"
            icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="transition-all"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>} 
            label="Estoque" 
          />
          
          {/* RUBY (ROSE/RED) */}
          <NavButton 
            v={ViewState.TRANSACTIONS} 
            activeColor="text-rose-500" 
            hoverColor="hover:text-rose-500"
            icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="transition-all"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} 
            label="Caixa" 
          />
          
          {/* AMETHYST (VIOLET/PURPLE) */}
          <NavButton 
            v={ViewState.SETTINGS} 
            activeColor="text-violet-500" 
            hoverColor="hover:text-violet-500"
            icon={({active}:any) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="transition-all"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>} 
            label="Config" 
          />
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
