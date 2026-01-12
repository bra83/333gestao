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

  const fetchData = useCallback(async () => {
    const targetUrl = apiUrl ? apiUrl.trim() : '';
    if (!targetUrl) {
      setSettings(DEFAULT_SETTINGS);
      setData(MOCK_DATA);
      return;
    }

    setLoading(true);
    setLastError(null);
    try {
      const fetchOptions: RequestInit = {
        method: 'GET',
        credentials: 'omit',
        redirect: 'follow',
      };

      const timestamp = new Date().getTime();
      const settingsRes = await fetch(`${targetUrl}?type=read_settings&t=${timestamp}`, fetchOptions);
      if (!settingsRes.ok) throw new Error(`Settings HTTP Error: ${settingsRes.status}`);
      
      const contentType = settingsRes.headers.get('content-type');
      if (!contentType || !contentType.includes('json')) {
        console.warn("Response Content-Type:", contentType);
        throw new Error('A resposta não é JSON. Verifique se o script está publicado como "Web App" para "Qualquer pessoa" (Anyone).');
      }

      const settingsJson = await settingsRes.json();
      setSettings(settingsJson);

      const dataRes = await fetch(`${targetUrl}?type=read_data&t=${timestamp}`, fetchOptions);
      if (!dataRes.ok) throw new Error(`Data HTTP Error: ${dataRes.status}`);
      const dataJson = await dataRes.json();

      const sanitizedStock = (dataJson.estoque || []).map((item: any, i: number) => ({
        ...item,
        id: (item.id && String(item.id).trim().length > 0) ? String(item.id) : `temp-st-${timestamp}-${i}`,
        peso: Number(item.peso) || 0,
        preco: Number(item.preco) || 0
      }));

      const sanitizedSales = (dataJson.vendas || []).map((item: any, i: number) => ({
        ...item,
        id: (item.id && String(item.id).trim().length > 0) ? String(item.id) : `temp-sale-${timestamp}-${i}`,
        venda: Number(item.venda) || 0,
        lucro: Number(item.lucro) || 0,
        peso: Number(item.peso) || 0
      }));

      const sanitizedExpenses = (dataJson.gastos || []).map((item: any, i: number) => ({
        ...item,
        id: (item.id && String(item.id).trim().length > 0) ? String(item.id) : `temp-exp-${timestamp}-${i}`,
        valor: Number(item.valor) || 0
      }));

      setData({
        estoque: sanitizedStock,
        vendas: sanitizedSales,
        gastos: sanitizedExpenses
      });
      
      showToast('Dados sincronizados!');

    } catch (err: any) {
      console.error('API Error:', err);
      const msg = err.message === 'Failed to fetch' 
        ? 'Erro de conexão (CORS/Rede). Usando dados offline.' 
        : `Erro: ${err.message}`;
      setLastError(msg);
      showToast(msg);
      setData(MOCK_DATA);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const apiCall = async (params: URLSearchParams) => {
    if(!apiUrl) return;
    try { 
      await fetch(`${apiUrl}?${params.toString()}`, { 
        method: 'POST', 
        mode: 'no-cors', 
        credentials: 'omit' 
      }); 
    } catch(e) { 
      console.error(e); 
    }
  };

  const handleSaveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    if (apiUrl) {
      setLoading(true);
      const params = new URLSearchParams({ type: 'save_settings' });
      Object.entries(newSettings).forEach(([key, val]) => {
        params.append(key, val.toString());
      });
      await apiCall(params);
      showToast('Configurações salvas!');
      setLoading(false);
    } else {
      showToast('Salvo localmente (Demo)');
    }
  };

  const handleAddStock = async (nome: string, marca: string, peso: number, preco: number, cor: string, tipo: string) => {
    const id = Date.now().toString();
    const newItem = { id, nome, marca, peso, preco, cor, tipo };
    setData(prev => ({ ...prev, estoque: [...prev.estoque, newItem] }));
    
    if (apiUrl) {
      const params = new URLSearchParams({ 
        type: 'estoque', action: 'create', id, nome, marca, 
        peso: peso.toString(), preco: preco.toString(), cor, tipo
      });
      apiCall(params);
    }
    showToast('Filamento adicionado!');
  };

  const handleUpdateStock = async (id: string, updates: Partial<StockItem>) => {
    setData(prev => ({
      ...prev,
      estoque: prev.estoque.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
    
    if (apiUrl) {
      const currentItem = data.estoque.find(i => i.id === id);
      const finalItem = { ...currentItem, ...updates };
      const params = new URLSearchParams({
        type: 'estoque', action: 'update', id,
        nome: finalItem.nome || '', marca: finalItem.marca || '',
        peso: (finalItem.peso || 0).toString(), preco: (finalItem.preco || 0).toString(),
        cor: finalItem.cor || '', tipo: finalItem.tipo || ''
      });
      apiCall(params);
    }
  };

  const handleDeleteStock = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja remover este filamento?")) return;
    setData(prev => ({ ...prev, estoque: prev.estoque.filter(item => item.id !== id) }));
    if (apiUrl) {
      const params = new URLSearchParams({ type: 'estoque', action: 'delete', id });
      apiCall(params);
    }
    showToast('Filamento removido!');
  };

  const handleAddSale = async (item: string, material: string, peso: number, venda: number, lucro: number, stockId?: string) => {
    const id = Date.now().toString();
    const newSale = { id, data: new Date().toISOString().split('T')[0], item, material, peso, venda, lucro };
    
    // 1. Adiciona Venda
    setData(prev => ({ ...prev, vendas: [newSale, ...prev.vendas] }));
    
    // 2. Desconta do Estoque (Se houver ID)
    if (stockId) {
      const stockItem = data.estoque.find(s => s.id === stockId);
      if (stockItem) {
         const newWeight = Math.max(0, stockItem.peso - peso);
         // Atualiza visualmente e na API
         handleUpdateStock(stockId, { peso: newWeight });
         showToast(`Estoque descontado: ${newWeight}g restantes`);
      }
    }

    if (apiUrl) {
      const params = new URLSearchParams({ 
        type: 'venda', action: 'create', id, item, material, peso: peso.toString(),
        venda: venda.toFixed(2), lucro: lucro.toFixed(2) 
      });
      apiCall(params);
    }
    showToast('Venda registrada!');
    setView(ViewState.TRANSACTIONS);
  };

  const handleUpdateSale = async (id: string, newVal: number, newProfit: number) => {
    setData(prev => ({
      ...prev,
      vendas: prev.vendas.map(s => s.id === id ? { ...s, venda: newVal, lucro: newProfit } : s)
    }));
    if (apiUrl) {
      const sale = data.vendas.find(s => s.id === id);
      if (sale) {
         const params = new URLSearchParams({ 
          type: 'venda', action: 'update', id, data: sale.data, item: sale.item, 
          material: sale.material, peso: sale.peso.toString(),
          venda: newVal.toFixed(2), lucro: newProfit.toFixed(2) 
        });
        apiCall(params);
      }
    }
    showToast('Venda atualizada!');
  };

  const handleDeleteSale = async (id: string) => {
    setData(prev => ({ ...prev, vendas: prev.vendas.filter(s => s.id !== id) }));
    if (apiUrl) {
        const params = new URLSearchParams({ type: 'venda', action: 'delete', id });
        apiCall(params);
    }
    showToast('Venda removida!');
  };

  const handleAddExpense = async (descricao: string, valor: number, dataStr: string) => {
    const id = Date.now().toString();
    const newExpense: Expense = { id, descricao, valor, data: dataStr };
    setData(prev => ({ ...prev, gastos: [newExpense, ...prev.gastos] }));
    if (apiUrl) {
      const params = new URLSearchParams({
        type: 'gasto', action: 'create', id, data: dataStr, descricao, valor: valor.toString()
      });
      apiCall(params);
    }
    showToast('Gasto registrado!');
  };

  const handleUpdateExpense = async (id: string, descricao: string, valor: number) => {
    setData(prev => ({
      ...prev,
      gastos: prev.gastos.map(g => g.id === id ? { ...g, descricao, valor } : g)
    }));
    if (apiUrl) {
      const exp = data.gastos.find(g => g.id === id);
      if (exp) {
        const params = new URLSearchParams({
          type: 'gasto', action: 'update', id, data: exp.data, descricao, valor: valor.toString()
        });
        apiCall(params);
      }
    }
    showToast('Gasto atualizado!');
  };

  const handleDeleteExpense = async (id: string) => {
    setData(prev => ({ ...prev, gastos: prev.gastos.filter(g => g.id !== id) }));
    if (apiUrl) {
      const params = new URLSearchParams({ type: 'gasto', action: 'delete', id });
      apiCall(params);
    }
    showToast('Gasto removido!');
  };

  const handleUrlChange = (val: string) => {
    setApiUrl(val);
    localStorage.setItem('APPS_SCRIPT_URL', val);
  };

  const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
  const IconCalc = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>;
  const IconBox = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
  const IconList = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
  const IconSettings = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;

  const NavButton = ({ v, icon: Icon, label }: { v: ViewState, icon: any, label: string }) => (
    <button 
      onClick={() => setView(v)} 
      className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${view === v ? 'text-primary scale-110' : 'text-secondary hover:text-primary/70'}`}
    >
      <Icon />
      <span className="text-[10px] mt-1 font-bold">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-dark text-slate-600 font-sans selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-emerald-100 p-4 z-20 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          {/* LOGO 333 - GORDINHO E ENCOSTADO */}
          <div className="flex items-center -space-x-1.5 select-none">
            <span className="text-4xl font-black text-primary tracking-tighter">3</span>
            <span className="text-4xl font-black text-emerald-300 tracking-tighter z-10">3</span>
            <span className="text-4xl font-black text-primary tracking-tighter">3</span>
          </div>
        </div>
        {loading && <div className="w-5 h-5 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>}
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        {view === ViewState.DASHBOARD && <DashboardView data={data} onNavigate={setView} />}
        {view === ViewState.CALCULATOR && (
          <Calculator 
            settings={settings} 
            stock={data.estoque} 
            onSaveSale={handleAddSale} 
          />
        )}
        {view === ViewState.INVENTORY && (
          <InventoryView 
            stock={data.estoque} 
            onAddStock={handleAddStock}
            onUpdateStock={handleUpdateStock}
            onDeleteStock={handleDeleteStock}
          />
        )}
        {view === ViewState.TRANSACTIONS && (
          <TransactionsView 
            sales={data.vendas} 
            expenses={data.gastos}
            onUpdateSale={handleUpdateSale} 
            onDeleteSale={handleDeleteSale}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}
        {view === ViewState.SETTINGS && (
          <SettingsView 
            settings={settings} 
            onSave={handleSaveSettings} 
            apiUrl={apiUrl} 
            onUrlChange={handleUrlChange}
            lastError={lastError}
            onRetry={fetchData}
          />
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur border-t border-emerald-100 pb-safe z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
        <div className="flex justify-around max-w-lg mx-auto pt-1">
          <NavButton v={ViewState.DASHBOARD} icon={IconHome} label="Início" />
          <NavButton v={ViewState.CALCULATOR} icon={IconCalc} label="Calc" />
          <NavButton v={ViewState.INVENTORY} icon={IconBox} label="Estoque" />
          <NavButton v={ViewState.TRANSACTIONS} icon={IconList} label="Finanças" />
          <NavButton v={ViewState.SETTINGS} icon={IconSettings} label="Config" />
        </div>
      </nav>
      
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white text-slate-700 px-6 py-3 rounded-full shadow-xl text-sm border border-emerald-100 z-50 animate-bounce font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          {toast}
        </div>
      )}
    </div>
  );
};

export default App;
