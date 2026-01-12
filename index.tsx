import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// ==========================================
// 1. TYPES
// ==========================================
export interface Settings {
  markup: number;
  kwh: number;
  potencia: number;
  embalagem: number;
  pintSimples: number;
  pintMedia: number;
  pintProf: number;
  aluguel: number;
  softwares: number;
  ecommerce: number;
  mei: number;
  publicidade: number;
  condominio: number;
  precoMaq: number;
  vidaUtil: number;
  horasTrab: number;
  FatPrevisto: number;
  perdaMaterial: number;
  eficienciaFonte: number;
  manutencaoMensal: number;
  vidaUtilHoras: number;
  valorHoraTrabalho: number;
  tempoPreparacao: number;
  tempoPosProcessamento: number;
  tempoAtendimento: number;
  risco: number;
  imposto: number;
  [key: string]: number;
}

export interface StockItem {
  id?: string;
  nome: string;
  marca?: string;
  peso: number;
  preco: number;
  cor?: string;
  tipo?: string;
}

export interface Sale {
  id: string;
  data: string;
  item: string;
  material: string;
  peso: number;
  venda: number;
  lucro: number;
}

export interface Expense {
  id: string;
  descricao: string;
  valor: number;
  data: string;
}

export interface AppData {
  estoque: StockItem[];
  vendas: Sale[];
  gastos: Expense[];
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CALCULATOR = 'CALCULATOR',
  INVENTORY = 'INVENTORY',
  SETTINGS = 'SETTINGS',
  TRANSACTIONS = 'TRANSACTIONS'
}

// ==========================================
// 2. CONSTANTS
// ==========================================
const DEFAULT_SETTINGS: Settings = {
  markup: 3.0,
  kwh: 0.95,
  potencia: 350,
  embalagem: 2.50,
  pintSimples: 20,
  pintMedia: 40,
  pintProf: 80,
  aluguel: 0,
  softwares: 50,
  ecommerce: 0,
  mei: 75,
  publicidade: 0,
  condominio: 0,
  precoMaq: 3500,
  vidaUtil: 24,
  horasTrab: 160,
  FatPrevisto: 5000,
  perdaMaterial: 5,
  eficienciaFonte: 0.9,
  manutencaoMensal: 20,
  vidaUtilHoras: 8000,
  valorHoraTrabalho: 25,
  tempoPreparacao: 15,
  tempoPosProcessamento: 15,
  tempoAtendimento: 10,
  risco: 10,
  imposto: 0,
};

const MOCK_DATA: AppData = {
  estoque: [
    { id: 'st1', nome: 'Deep Black', marca: 'Voolt3D', peso: 820, preco: 120, cor: '#1e293b', tipo: 'PLA' },
    { id: 'st2', nome: 'Arctic White', marca: 'Voolt3D', peso: 140, preco: 110, cor: '#f8fafc', tipo: 'PLA' },
    { id: 'st3', nome: 'Crystal Clear', marca: '3D Fila', peso: 1000, preco: 140, cor: '#cbd5e1', tipo: 'PETG' },
    { id: 'st4', nome: 'Fire Red', marca: 'Creality', peso: 150, preco: 90, cor: '#ef4444', tipo: 'ABS' },
    { id: 'st5', nome: 'Royal Blue', marca: 'Voolt3D', peso: 400, preco: 130, cor: '#3b82f6', tipo: 'SILK' },
  ],
  vendas: [
    { id: 'v1', data: '2026-01-10', item: 'Suporte XYZ', material: 'PLA "Preto"', peso: 45, venda: 120, lucro: 75 },
    { id: 'v2', data: '2026-01-12', item: 'Vaso Geométrico', material: 'PLA "Branco"', peso: 120, venda: 80, lucro: 45 },
    { id: 'v3', data: '2026-01-15', item: 'Peça Técnica', material: 'ABS "Vermelho"', peso: 200, venda: 200, lucro: 120 },
  ],
  gastos: [
    { id: '17000001', data: '2026-01-10', descricao: 'Manutenção Bico', valor: 50 },
    { id: '17000002', data: '2026-01-14', descricao: 'Álcool Isopropílico', valor: 25 },
  ]
};

// ==========================================
// 3. COMPONENTS
// ==========================================

// --- SpoolCard ---
const SpoolCard: React.FC<{ item: StockItem; onUpdate: any; onDelete: any }> = ({ item, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.nome);
  const [editBrand, setEditBrand] = useState(item.marca || '');
  const [editWeight, setEditWeight] = useState(item.peso.toString());
  const [editPrice, setEditPrice] = useState(item.preco.toString());
  const [editColor, setEditColor] = useState(item.cor || '#3b82f6');
  const [editType, setEditType] = useState(item.tipo || 'PLA');

  const MATERIAL_TYPES = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'SILK', 'RESINA', 'NYLON', 'OUTRO'];

  const { color, percentage, type, isLowStock } = useMemo(() => {
    let extractedColor = item.cor || '#3b82f6';
    if (!item.cor) {
       const match = item.nome.match(/"([^"]+)"/);
       const colorMap: Record<string, string> = {
          preto: '#1e293b', black: '#1e293b', branco: '#f8fafc', white: '#f8fafc',
          vermelho: '#ef4444', red: '#ef4444', azul: '#3b82f6', blue: '#3b82f6',
          verde: '#22c55e', green: '#22c55e', amarelo: '#eab308', yellow: '#eab308',
          laranja: '#f97316', orange: '#f97316', cinza: '#94a3b8', grey: '#94a3b8',
          roxo: '#a855f7', purple: '#a855f7',
       };
       if (match && match[1] && colorMap[match[1].toLowerCase()]) extractedColor = colorMap[match[1].toLowerCase()];
    }
    let matType = item.tipo || 'PLA';
    if (!item.tipo) {
       if (item.nome.toUpperCase().includes('PETG')) matType = 'PETG';
       if (item.nome.toUpperCase().includes('ABS')) matType = 'ABS';
    }
    const pct = Math.min(100, Math.max(0, (item.peso / 1000) * 100));
    return { color: extractedColor, percentage: pct, type: matType, isLowStock: item.peso < 200 };
  }, [item]);

  const handleSave = () => {
    if (item.id) {
        onUpdate(item.id, {
            nome: editName, marca: editBrand, peso: Number(editWeight),
            preco: Number(editPrice), cor: editColor, tipo: editType
        });
    }
    setIsEditing(false);
  };

  if (isEditing) {
      return (
        <div className="bg-white p-4 rounded-2xl shadow-lg flex flex-col gap-2 border border-emerald-200 relative z-30">
            <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Editar</h4>
            <div className="flex gap-2">
                <input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 text-xs" value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Nome" />
                <input type="color" className="w-8 h-8 p-0 rounded border-none" value={editColor} onChange={e=>setEditColor(e.target.value)} />
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 text-xs" value={editType} onChange={e=>setEditType(e.target.value)}>
                {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 text-xs" value={editBrand} onChange={e=>setEditBrand(e.target.value)} placeholder="Marca" />
            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="text-[10px] text-slate-400">Peso (g)</label>
                    <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 text-xs" value={editWeight} onChange={e=>setEditWeight(e.target.value)} />
                </div>
                <div className="flex-1">
                    <label className="text-[10px] text-slate-400">Preço</label>
                    <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 text-xs" value={editPrice} onChange={e=>setEditPrice(e.target.value)} />
                </div>
            </div>
            <div className="flex gap-2 mt-2">
                <button onClick={handleSave} className="flex-1 bg-green-500 text-white py-1 rounded-lg text-xs font-bold shadow-sm">Salvar</button>
                <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-200 text-slate-600 py-1 rounded-lg text-xs">Cancelar</button>
            </div>
        </div>
      )
  }

  return (
    <div className={`bg-white p-4 rounded-3xl shadow-sm flex flex-col items-center relative overflow-hidden group border-2 transition-all hover:shadow-md ${isLowStock ? 'border-red-200 bg-red-50/50' : 'border-white hover:border-emerald-100'}`}>
      <div className="absolute top-2 left-2 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button type="button" onClick={() => setIsEditing(true)} className="bg-white/90 text-blue-400 p-1.5 rounded-full hover:bg-blue-50 border border-blue-100 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        </button>
        <button type="button" onClick={() => item.id && onDelete(item.id)} className="bg-white/90 text-red-400 p-1.5 rounded-full hover:bg-red-50 border border-red-100 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </div>
      <div className="absolute top-2 left-2 z-20 group-hover:opacity-0 transition-opacity">
        <span className="bg-white/80 backdrop-blur text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-100 shadow-sm uppercase">{type}</span>
      </div>
      <div className={`absolute top-2 right-2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${isLowStock ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
        {isLowStock && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
        {Math.round(percentage)}%
      </div>
      <div className="relative w-28 h-28 rounded-full border-4 border-slate-100 bg-slate-50 overflow-hidden mb-3 shadow-inner">
        <div className="absolute bottom-0 left-0 w-full transition-all duration-500 ease-in-out" style={{ height: `${percentage}%`, backgroundColor: color, opacity: 0.9 }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border border-slate-200 z-10 flex items-center justify-center shadow-sm"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent to-white opacity-20 rounded-full pointer-events-none"></div>
      </div>
      <h3 className="text-slate-800 font-bold text-base text-center leading-tight mb-0 truncate w-full" title={item.nome}>{item.nome.replace(/"[^"]+"/g, '').trim()}</h3>
      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-3 truncate max-w-full">{item.marca || 'Genérico'}</span>
      <div className="w-full flex justify-between items-center text-xs font-bold text-slate-500 mt-auto border-t border-slate-100 pt-2">
        <span className={isLowStock ? 'text-red-400' : ''}>{item.peso}g</span>
        <span className="bg-slate-50 px-2 py-0.5 rounded-lg text-slate-600">R$ {item.preco}</span>
      </div>
    </div>
  );
};

// --- Calculator ---
const Calculator: React.FC<{ settings: Settings; stock: StockItem[]; onSaveSale: any }> = ({ settings, stock, onSaveSale }) => {
  const [mode, setMode] = useState<'basic' | 'advanced'>('advanced');
  const [selectedFilamentIdx, setSelectedFilamentIdx] = useState<number>(0);
  const [itemName, setItemName] = useState<string>('');
  const [weight, setWeight] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [paintingType, setPaintingType] = useState<'none' | 'simple' | 'medium' | 'pro'>('none');
  const [prepTime, setPrepTime] = useState<number>(settings.tempoPreparacao || 15);
  const [postTime, setPostTime] = useState<number>(settings.tempoPosProcessamento || 15);
  const [failRate, setFailRate] = useState<number>(settings.risco || 10);
  const [costs, setCosts] = useState({ materialTotal: 0, energyTotal: 0, machineTotal: 0, laborTotal: 0, fixedTotal: 0, servicesTotal: 0, subtotal: 0, riskValue: 0, totalCost: 0, finalPrice: 0, profit: 0 });

  useEffect(() => {
    if (stock.length === 0) return;
    const filament = stock[selectedFilamentIdx];
    const materialBase = (weight / 1000) * filament.preco;
    const materialLoss = materialBase * ((settings.perdaMaterial || 5) / 100);
    const materialTotal = materialBase + materialLoss;
    const powerKW = (settings.potencia / 1000);
    const efficiency = settings.eficienciaFonte || 0.9;
    const energyConsumption = (powerKW * hours) / efficiency;
    const energyTotal = energyConsumption * settings.kwh;
    const depreciationPerHour = settings.precoMaq / (settings.vidaUtilHoras || 8000);
    const maintenancePerHour = (settings.manutencaoMensal || 20) / settings.horasTrab;
    const machineTotal = (depreciationPerHour + maintenancePerHour) * hours;
    const laborHourlyRate = settings.valorHoraTrabalho || 20;
    const totalLaborMinutes = mode === 'advanced' ? (prepTime + postTime + (settings.tempoAtendimento || 10)) : 0; 
    const laborTotal = (totalLaborMinutes / 60) * laborHourlyRate;
    const totalMonthlyFixed = settings.aluguel + settings.mei + settings.softwares + settings.ecommerce + settings.publicidade + settings.condominio;
    const fixedCostPerHour = totalMonthlyFixed / settings.horasTrab;
    const fixedTotal = fixedCostPerHour * hours;
    let paintCost = 0;
    if (paintingType === 'simple') paintCost = settings.pintSimples;
    if (paintingType === 'medium') paintCost = settings.pintMedia;
    if (paintingType === 'pro') paintCost = settings.pintProf;
    const servicesTotal = settings.embalagem + paintCost;
    const subtotal = materialTotal + energyTotal + machineTotal + laborTotal + fixedTotal + servicesTotal;
    const riskPct = mode === 'advanced' ? (failRate / 100) : 0;
    const riskValue = subtotal * riskPct;
    const totalCost = subtotal + riskValue;
    const finalPrice = totalCost * settings.markup;
    const profit = finalPrice - totalCost;
    setCosts({ materialTotal, energyTotal, machineTotal, laborTotal, fixedTotal, servicesTotal, subtotal, riskValue, totalCost, finalPrice, profit });
  }, [weight, hours, paintingType, selectedFilamentIdx, settings, stock, mode, prepTime, postTime, failRate]);

  const handleSave = () => {
    if (!itemName) return alert('Digite o nome do item');
    const filament = stock[selectedFilamentIdx];
    const materialName = filament.marca ? `${filament.nome} (${filament.marca})` : filament.nome;
    if (window.confirm(`Registrar venda de "${itemName}" por R$ ${costs.finalPrice.toFixed(2)}?`)) {
      onSaveSale(itemName, materialName, weight, costs.finalPrice, costs.profit);
      setItemName(''); setWeight(0); setHours(0);
    }
  };

  if (stock.length === 0) return <div className="p-8 text-center text-secondary">Adicione filamentos ao estoque primeiro.</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex bg-white p-1.5 rounded-2xl border border-emerald-100 shadow-sm">
        <button onClick={() => setMode('basic')} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${mode === 'basic' ? 'bg-slate-100 text-slate-700 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}>Básico</button>
        <button onClick={() => setMode('advanced')} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${mode === 'advanced' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Avançado 🧠</button>
      </div>
      <div className="bg-surface p-5 rounded-2xl shadow-sm border border-emerald-100">
        <h2 className="text-lg font-bold text-slate-700 mb-4">Parâmetros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2"><label className="block text-xs text-secondary mb-1 font-bold ml-1">NOME DO PROJETO</label><input type="text" className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-primary/50 font-semibold" value={itemName} onChange={e => setItemName(e.target.value)} /></div>
          <div><label className="block text-xs text-secondary mb-1 font-bold ml-1">FILAMENTO</label><select className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-primary/50 text-sm" value={selectedFilamentIdx} onChange={e => setSelectedFilamentIdx(Number(e.target.value))}>{stock.map((item, idx) => (<option key={idx} value={idx}>{item.nome} {item.marca ? `(${item.marca})` : ''}</option>))}</select></div>
          <div><label className="block text-xs text-secondary mb-1 font-bold ml-1">ACABAMENTO</label><select className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-primary/50 text-sm" value={paintingType} onChange={e => setPaintingType(e.target.value as any)}><option value="none">Nenhum</option><option value="simple">Simples (+R$ {settings.pintSimples})</option><option value="medium">Médio (+R$ {settings.pintMedia})</option><option value="pro">Profissional (+R$ {settings.pintProf})</option></select></div>
          <div className="flex gap-4">
             <div className="flex-1"><label className="block text-xs text-secondary mb-1 font-bold ml-1">PESO (g)</label><input type="number" className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-primary font-black text-xl focus:outline-none focus:border-primary/50" value={weight || ''} onChange={e => setWeight(Number(e.target.value))} /></div>
             <div className="flex-1"><label className="block text-xs text-secondary mb-1 font-bold ml-1">TEMPO (h)</label><input type="number" className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-primary font-black text-xl focus:outline-none focus:border-primary/50" value={hours || ''} onChange={e => setHours(Number(e.target.value))} /></div>
          </div>
          {mode === 'advanced' && (
            <div className="col-span-1 md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
              <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase">Detalhes Técnicos</h4>
              <div className="grid grid-cols-3 gap-3">
                 <div><label className="text-[10px] text-slate-400 block font-bold mb-1">PREP (MIN)</label><input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-700 text-sm font-bold" value={prepTime} onChange={e => setPrepTime(Number(e.target.value))} /></div>
                 <div><label className="text-[10px] text-slate-400 block font-bold mb-1">PÓS (MIN)</label><input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-700 text-sm font-bold" value={postTime} onChange={e => setPostTime(Number(e.target.value))} /></div>
                 <div><label className="text-[10px] text-slate-400 block font-bold mb-1">RISCO (%)</label><input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-700 text-sm font-bold" value={failRate} onChange={e => setFailRate(Number(e.target.value))} /></div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-surface p-6 rounded-2xl shadow-md border border-emerald-200 relative overflow-hidden">
        <h3 className="text-lg font-bold text-slate-700 mb-4 border-b border-emerald-100 pb-2 flex justify-between"><span>Detalhamento</span><span className="text-xs bg-emerald-100 text-primary px-2 py-1 rounded-full">{mode === 'advanced' ? 'Completo' : 'Simples'}</span></h3>
        <div className="space-y-2 text-sm">
          <Row label="1. Material (c/ perda)" value={costs.materialTotal} />
          <Row label="2. Energia" value={costs.energyTotal} />
          <Row label="3. Máquina (Deprec/Manut)" value={costs.machineTotal} color="text-slate-400" />
          <Row label="4. Mão de Obra" value={costs.laborTotal} color={mode === 'basic' ? 'text-slate-300 line-through' : 'text-blue-400'} />
          <Row label="5. Custos Fixos (Hora)" value={costs.fixedTotal} />
          <Row label="6. Serviços (Pint/Emb)" value={costs.servicesTotal} />
          <Row label="7. Risco Operacional" value={costs.riskValue} color={mode === 'basic' ? 'text-slate-300 line-through' : 'text-orange-400'} />
          <div className="border-t border-dashed border-slate-200 my-3 pt-1"></div>
          <div className="flex justify-between text-base font-bold"><span className="text-slate-500">Custo Total</span><span className="text-slate-500">R$ {costs.totalCost.toFixed(2)}</span></div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-emerald-400 to-primary p-6 rounded-2xl shadow-xl shadow-emerald-200 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 pointer-events-none"></div>
        <span className="block text-xs text-white/80 uppercase tracking-widest font-bold mb-1">Preço Final Sugerido</span>
        <div className="text-5xl font-black text-white mb-2 tracking-tight">R$ {costs.finalPrice.toFixed(2)}</div>
        <div className="text-white text-sm font-bold bg-white/20 inline-block px-4 py-1.5 rounded-full backdrop-blur-sm">Lucro Líquido: R$ {costs.profit.toFixed(2)}</div>
        <button onClick={handleSave} className="mt-6 w-full bg-white text-primary font-black py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform active:scale-95">REGISTRAR VENDA</button>
      </div>
    </div>
  );
};
const Row = ({ label, value, color = 'text-slate-600' }: any) => (<div className="flex justify-between items-center"><span className="text-slate-400 text-xs font-semibold">{label}</span><span className={`font-mono font-bold ${color}`}>R$ {value.toFixed(2)}</span></div>);

// --- Dashboard ---
const DashboardView: React.FC<{ data: AppData; onNavigate: any }> = ({ data, onNavigate }) => {
  const totalSales = data.vendas.reduce((acc, curr) => acc + curr.venda, 0);
  const grossProfit = data.vendas.reduce((acc, curr) => acc + curr.lucro, 0);
  const totalExpenses = data.gastos.reduce((acc, curr) => acc + curr.valor, 0);
  const netProfit = grossProfit - totalExpenses;
  const recentSales = data.vendas.slice(0, 5).reverse();
  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow"><span className="text-secondary text-xs font-bold uppercase tracking-wider">Faturamento</span><div className="text-2xl font-black text-slate-700 mt-1">R$ {totalSales.toFixed(2)}</div></div>
        <div className="bg-surface p-5 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-shadow"><span className="text-red-400 text-xs font-bold uppercase tracking-wider">Gastos Totais</span><div className="text-2xl font-black text-red-500 mt-1">- R$ {totalExpenses.toFixed(2)}</div></div>
      </div>
      <div className={`p-6 rounded-2xl shadow-md border transition-all ${netProfit >= 0 ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200' : 'bg-gradient-to-br from-red-50 to-white border-red-200'}`}>
        <div className="flex justify-between items-center mb-1"><span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Lucro Líquido Real</span>{netProfit >= 0 ? (<span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">POSITIVO</span>) : (<span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">NEGATIVO</span>)}</div>
        <div className={`text-4xl font-black mt-1 ${netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>R$ {netProfit.toFixed(2)}</div>
        <p className="text-[10px] text-slate-400 mt-2">(Lucro das Vendas - Despesas Operacionais)</p>
      </div>
      <div className="bg-surface p-5 rounded-2xl border border-emerald-100 shadow-sm h-64"><h3 className="text-slate-700 mb-4 font-bold">Últimas Vendas</h3><ResponsiveContainer width="100%" height="100%"><BarChart data={recentSales}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} /><XAxis dataKey="item" tick={{fill: '#94a3b8', fontSize: 10}} interval={0} axisLine={false} tickLine={false} /><YAxis tick={{fill: '#94a3b8', fontSize: 10}} axisLine={false} tickLine={false} /><Tooltip cursor={{fill: '#ecfdf5'}} contentStyle={{backgroundColor: '#fff', borderColor: '#a7f3d0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#334155'}} itemStyle={{color: '#10b981', fontWeight: 'bold'}} /><Bar dataKey="venda" fill="#10b981" radius={[6, 6, 6, 6]} barSize={20} /></BarChart></ResponsiveContainer></div>
      <div className="bg-surface p-6 rounded-2xl border border-emerald-100 shadow-sm"><h3 className="text-slate-700 mb-2 font-bold">Resumo do Estoque</h3><p className="text-secondary text-sm mb-5">Você tem <strong className="text-primary">{data.estoque.length}</strong> rolos registrados.</p><button onClick={() => onNavigate(ViewState.INVENTORY)} className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">Gerenciar Estoque</button></div>
    </div>
  );
};

// --- Inventory ---
const InventoryView: React.FC<{ stock: StockItem[]; onAddStock: any; onUpdateStock: any; onDeleteStock: any }> = ({ stock, onAddStock, onUpdateStock, onDeleteStock }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemBrand, setNewItemBrand] = useState('');
  const [newItemWeight, setNewItemWeight] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemColor, setNewItemColor] = useState('#3b82f6');
  const [newItemType, setNewItemType] = useState('PLA');
  const MATERIAL_TYPES = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'SILK', 'RESINA', 'NYLON', 'OUTRO'];

  const submitStock = () => {
    if(!newItemName || !newItemWeight || !newItemPrice) return;
    onAddStock(newItemName, newItemBrand, Number(newItemWeight), Number(newItemPrice), newItemColor, newItemType);
    setNewItemName(''); setNewItemBrand(''); setNewItemWeight(''); setNewItemPrice(''); setNewItemColor('#3b82f6');
  };
  const lowStockItems = useMemo(() => stock.filter(item => item.peso < 200), [stock]);

  return (
    <div className="space-y-6 pb-20">
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 shadow-sm"><div className="flex items-center gap-2 text-red-500 font-bold mb-1"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>Filamento Acabando!</span></div><ul className="list-disc list-inside text-sm text-red-400 pl-1">{lowStockItems.map((item, idx) => (<li key={idx}>{item.nome} ({item.peso}g)</li>))}</ul></div>
      )}
      <div className="bg-surface p-5 rounded-2xl border border-emerald-100 shadow-sm">
        <h3 className="text-slate-700 font-bold mb-3">Novo Carretel</h3>
        <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-2 gap-2"><input className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-sm focus:border-primary focus:outline-none" placeholder='Nome' value={newItemName} onChange={e => setNewItemName(e.target.value)} /><select className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-sm focus:border-primary focus:outline-none" value={newItemType} onChange={e => setNewItemType(e.target.value)}>{MATERIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="grid grid-cols-[1fr_auto] gap-2"><input className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-sm focus:border-primary focus:outline-none" placeholder='Marca' value={newItemBrand} onChange={e => setNewItemBrand(e.target.value)} /><div className="relative overflow-hidden rounded-xl border border-slate-200 w-12 h-full"><input type="color" className="absolute -top-2 -left-2 w-16 h-16 p-0 border-none cursor-pointer" value={newItemColor} onChange={e => setNewItemColor(e.target.value)}/></div></div>
            <div className="flex gap-2"><input type="number" className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 w-1/2 text-sm focus:border-primary focus:outline-none" placeholder='Peso (g)' value={newItemWeight} onChange={e => setNewItemWeight(e.target.value)} /><input type="number" className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 w-1/2 text-sm focus:border-primary focus:outline-none" placeholder='Preço (1kg)' value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} /></div>
            <button onClick={submitStock} className="bg-primary hover:bg-emerald-700 text-white py-3 rounded-xl font-bold mt-2 text-sm uppercase tracking-wide shadow-lg shadow-emerald-200 transition-all active:scale-95">Adicionar ao Estoque</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">{stock.map((item, idx) => (<SpoolCard key={item.id || idx} item={item} onUpdate={onUpdateStock} onDelete={onDeleteStock} />))}</div>
    </div>
  );
};

// --- Settings ---
const SettingsView: React.FC<{ settings: Settings; onSave: any; apiUrl: string; onUrlChange: any; lastError?: any; onRetry?: any }> = ({ settings, onSave, apiUrl, onUrlChange, lastError, onRetry }) => {
  const [formData, setFormData] = useState<Settings>(settings);
  const handleChange = (key: keyof Settings, value: string) => setFormData(prev => ({ ...prev, [key]: Number(value) }));
  const Input = ({ label, val, onChange, step }: any) => (<div><label className="text-slate-400 text-[10px] font-bold block mb-1 truncate uppercase">{label}</label><input type="number" step={step} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all" value={val} onChange={e => onChange(e.target.value)} /></div>);
  const Section = ({ title, children }: any) => (<div className="border-b border-emerald-50 pb-6 last:border-0 last:pb-0"><h4 className="text-primary text-xs font-black uppercase tracking-wider mb-4">{title}</h4>{children}</div>);
  
  return (
    <div className="space-y-6 pb-20">
      <div className={`bg-white p-5 rounded-2xl border ${lastError ? 'border-red-200 shadow-red-50' : 'border-green-200 shadow-green-50'} shadow-sm`}>
        <div className="flex justify-between items-center mb-3"><label className="text-slate-500 text-xs font-bold uppercase tracking-wide">Integração Google Sheets</label>{lastError ? (<span className="text-xs bg-red-100 text-red-500 px-3 py-1 rounded-full font-bold">Desconectado</span>) : (<span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold">Conectado</span>)}</div>
        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-600 text-xs mb-3 font-mono" value={apiUrl} onChange={e=>onUrlChange(e.target.value)} placeholder="https://script.google.com/..." />
        {lastError && <div className="bg-red-50 p-3 rounded-xl text-xs text-red-500 mb-3 border border-red-100">{lastError}</div>}
        {onRetry && <button onClick={onRetry} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs py-3 rounded-xl font-bold transition-colors">Testar Conexão</button>}
      </div>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100"><h3 className="text-slate-700 font-bold mb-6 border-b border-emerald-50 pb-3 text-lg">Configuração</h3>
        <div className="space-y-8">
          <Section title="1. Máquina & Energia"><div className="grid grid-cols-2 gap-3"><Input label="Preço Máquina (R$)" val={formData.precoMaq} onChange={(v:any) => handleChange('precoMaq', v)} /><Input label="Vida Útil (Horas)" val={formData.vidaUtilHoras || 8000} onChange={(v:any) => handleChange('vidaUtilHoras', v)} /><Input label="Manutenção Mensal" val={formData.manutencaoMensal || 20} onChange={(v:any) => handleChange('manutencaoMensal', v)} /><Input label="Potência (W)" val={formData.potencia} onChange={(v:any) => handleChange('potencia', v)} /><Input label="Custo kWh" val={formData.kwh} step={0.01} onChange={(v:any) => handleChange('kwh', v)} /><Input label="Eficiência Fonte" val={formData.eficienciaFonte || 0.9} step={0.01} onChange={(v:any) => handleChange('eficienciaFonte', v)} /></div></Section>
          <Section title="2. Empresa"><div className="col-span-2 mb-2"><Input label="Horas Trab/Mês" val={formData.horasTrab} onChange={(v:any) => handleChange('horasTrab', v)} /></div><div className="grid grid-cols-3 gap-2"><Input label="MEI" val={formData.mei} onChange={(v:any) => handleChange('mei', v)} /><Input label="Aluguel" val={formData.aluguel} onChange={(v:any) => handleChange('aluguel', v)} /><Input label="Soft" val={formData.softwares} onChange={(v:any) => handleChange('softwares', v)} /><Input label="Loja" val={formData.ecommerce} onChange={(v:any) => handleChange('ecommerce', v)} /><Input label="Ads" val={formData.publicidade} onChange={(v:any) => handleChange('publicidade', v)} /><Input label="Outros" val={formData.condominio} onChange={(v:any) => handleChange('condominio', v)} /></div></Section>
          <Section title="3. Mão de Obra"><div className="grid grid-cols-2 gap-3"><Input label="Valor Hora (R$)" val={formData.valorHoraTrabalho || 25} onChange={(v:any) => handleChange('valorHoraTrabalho', v)} /><Input label="Prep (min)" val={formData.tempoPreparacao || 15} onChange={(v:any) => handleChange('tempoPreparacao', v)} /><Input label="Pós (min)" val={formData.tempoPosProcessamento || 15} onChange={(v:any) => handleChange('tempoPosProcessamento', v)} /><Input label="Atend (min)" val={formData.tempoAtendimento || 10} onChange={(v:any) => handleChange('tempoAtendimento', v)} /></div></Section>
          <Section title="4. Serviços"><div className="grid grid-cols-2 gap-3"><Input label="Perda (%)" val={formData.perdaMaterial || 5} onChange={(v:any) => handleChange('perdaMaterial', v)} /><Input label="Embalagem" val={formData.embalagem} onChange={(v:any) => handleChange('embalagem', v)} /></div><div className="grid grid-cols-3 gap-2 mt-2"><Input label="Pint. Simp" val={formData.pintSimples} onChange={(v:any) => handleChange('pintSimples', v)} /><Input label="Pint. Méd" val={formData.pintMedia} onChange={(v:any) => handleChange('pintMedia', v)} /><Input label="Pint. Prof" val={formData.pintProf} onChange={(v:any) => handleChange('pintProf', v)} /></div></Section>
          <Section title="5. Estratégia"><div className="grid grid-cols-2 gap-3"><Input label="Markup" val={formData.markup} step={0.1} onChange={(v:any) => handleChange('markup', v)} /><Input label="Risco (%)" val={formData.risco || 10} onChange={(v:any) => handleChange('risco', v)} /></div></Section>
          <button onClick={() => onSave(formData)} className="w-full bg-primary hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-200 mt-4 text-sm uppercase tracking-wide transition-transform active:scale-95">Salvar Tudo</button>
        </div>
      </div>
    </div>
  );
};

// --- Transactions ---
const TransactionsView: React.FC<any> = ({ sales, expenses, onUpdateSale, onDeleteSale, onAddExpense, onUpdateExpense, onDeleteExpense }) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses'>('sales');
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [editSalePrice, setEditSalePrice] = useState('');
  const [editSaleProfit, setEditSaleProfit] = useState('');
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpVal, setNewExpVal] = useState('');
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editExpDesc, setEditExpDesc] = useState('');
  const [editExpVal, setEditExpVal] = useState('');
  const totalExpenses = expenses.reduce((acc: number, curr: any) => acc + curr.valor, 0);

  const startEditSale = (sale: Sale) => { setEditingSaleId(sale.id); setEditSalePrice(sale.venda.toString()); setEditSaleProfit(sale.lucro.toString()); };
  const saveEditSale = (id: string) => { onUpdateSale(id, Number(editSalePrice), Number(editSaleProfit)); setEditingSaleId(null); };
  const submitNewExpense = () => { if (!newExpDesc || !newExpVal) return; onAddExpense(newExpDesc, Number(newExpVal), new Date().toISOString().split('T')[0]); setNewExpDesc(''); setNewExpVal(''); };
  const startEditExpense = (exp: Expense) => { setEditingExpId(exp.id); setEditExpDesc(exp.descricao); setEditExpVal(exp.valor.toString()); };
  const saveEditExpense = (id: string) => { onUpdateExpense(id, editExpDesc, Number(editExpVal)); setEditingExpId(null); };

  // Helper para Delete com segurança e stopPropagation
  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); // Garante que não dispare outros eventos
    if (window.confirm('Apagar?')) {
      onDeleteExpense(id);
    }
  };

  return (
    <div className="pb-20">
      <div className="flex bg-white p-1 rounded-2xl mb-6 border border-emerald-100 shadow-sm">
        <button onClick={() => setActiveTab('sales')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'sales' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Vendas 💰</button>
        <button onClick={() => setActiveTab('expenses')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'expenses' ? 'bg-red-400 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Gastos 💸</button>
      </div>
      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2"><h3 className="text-slate-700 font-bold text-lg">Histórico</h3><span className="text-xs text-primary font-bold bg-emerald-100 px-3 py-1 rounded-full">{sales.length} vendas</span></div>
          {sales.length === 0 && (<div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">Nenhuma venda registrada ainda.</div>)}
          {sales.map((sale: Sale, idx: number) => (
            <div key={sale.id || idx} className="bg-white p-5 rounded-3xl border border-emerald-50 shadow-sm relative group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                 <div><div className="text-slate-700 font-bold text-lg">{sale.item}</div><div className="text-slate-400 text-xs font-semibold">{sale.data} • {sale.material || 'N/A'} ({sale.peso || 0}g)</div></div>
                 {editingSaleId === sale.id ? (<div className="text-right flex flex-col gap-1"><button onClick={() => saveEditSale(sale.id)} className="text-green-500 text-xs font-bold border border-green-200 bg-green-50 px-2 py-1 rounded-lg">SALVAR</button><button onClick={() => setEditingSaleId(null)} className="text-slate-400 text-xs px-2 py-1">CANCELAR</button></div>) : (<div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"><button type="button" onClick={() => startEditSale(sale)} className="bg-slate-50 p-2 rounded-full text-blue-400 hover:bg-blue-50 border border-slate-100"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button><button type="button" onClick={(e) => window.confirm('Apagar?') && onDeleteSale(sale.id)} className="bg-slate-50 p-2 rounded-full text-red-400 hover:bg-red-50 border border-slate-100"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button></div>)}
              </div>
              {editingSaleId === sale.id ? (<div className="flex gap-2 mt-3 bg-slate-50 p-3 rounded-xl"><div className="flex-1"><label className="text-[10px] text-slate-400 font-bold">Venda</label><input className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-700 text-sm" value={editSalePrice} onChange={e => setEditSalePrice(e.target.value)} type="number" /></div><div className="flex-1"><label className="text-[10px] text-slate-400 font-bold">Lucro</label><input className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-700 text-sm" value={editSaleProfit} onChange={e => setEditSaleProfit(e.target.value)} type="number" /></div></div>) : (<div className="flex justify-between items-end border-t border-dashed border-slate-100 pt-3 mt-2"><div className="text-green-600 text-xs font-bold bg-green-100 px-3 py-1 rounded-full">Lucro: R$ {sale.lucro.toFixed(2)}</div><div className="text-slate-700 font-black text-xl">R$ {sale.venda.toFixed(2)}</div></div>)}
            </div>
          ))}
        </div>
      )}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm"><span className="text-red-400 text-xs font-black uppercase tracking-widest mb-1">Total de Débitos</span><span className="text-3xl font-black text-red-500">R$ {totalExpenses.toFixed(2)}</span></div>
          <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm"><h3 className="text-slate-700 font-bold mb-3">Novo Gasto</h3><div className="flex gap-2 mb-3"><input className="flex-[2] bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-sm focus:border-red-400 focus:outline-none" placeholder="Descrição" value={newExpDesc} onChange={e => setNewExpDesc(e.target.value)} /><input className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-sm focus:border-red-400 focus:outline-none" placeholder="R$" type="number" value={newExpVal} onChange={e => setNewExpVal(e.target.value)} /></div><button type="button" onClick={submitNewExpense} className="w-full bg-red-400 hover:bg-red-500 text-white font-bold py-3 rounded-xl text-sm uppercase shadow-lg shadow-red-100">Registrar Gasto</button></div>
          <h3 className="text-slate-700 font-bold px-2 text-lg">Saídas</h3>
          {expenses.slice().reverse().map((exp: Expense, idx: number) => (
             <div key={exp.id || idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center group relative shadow-sm hover:shadow-md transition-all">
                {editingExpId === exp.id ? (<div className="w-full flex gap-2 items-center"><div className="flex-1 space-y-1"><input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 text-xs" value={editExpDesc} onChange={e => setEditExpDesc(e.target.value)} /><input className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 text-xs" type="number" value={editExpVal} onChange={e => setEditExpVal(e.target.value)} /></div><div className="flex flex-col gap-1"><button onClick={() => saveEditExpense(exp.id)} className="bg-green-500 text-white p-1 rounded-lg text-[10px] font-bold">OK</button><button onClick={() => setEditingExpId(null)} className="bg-slate-200 text-slate-600 p-1 rounded-lg text-[10px]">X</button></div></div>) : (<><div><div className="text-slate-700 font-bold">{exp.descricao}</div><div className="text-slate-400 text-xs font-semibold">{exp.data}</div></div><div className="text-right"><div className="text-red-400 font-black text-lg">- R$ {exp.valor.toFixed(2)}</div></div><div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2"><button type="button" onClick={() => startEditExpense(exp)} className="bg-slate-50 p-1.5 rounded-lg text-blue-400 border border-slate-100"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button><button type="button" onClick={(e) => handleDeleteClick(e, exp.id)} className="bg-slate-50 p-1.5 rounded-lg text-red-400 border border-slate-100"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div></>)}
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. MAIN APP
// ==========================================
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

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchData = useCallback(async () => {
    const targetUrl = apiUrl ? apiUrl.trim() : '';
    if (!targetUrl) { setSettings(DEFAULT_SETTINGS); setData(MOCK_DATA); return; }
    setLoading(true); setLastError(null);
    try {
      const ts = new Date().getTime();
      const settingsRes = await fetch(`${targetUrl}?type=read_settings&t=${ts}`, {credentials: 'omit'});
      if (!settingsRes.ok) throw new Error('Erro HTTP Settings');
      const settingsJson = await settingsRes.json();
      setSettings(settingsJson);

      const dataRes = await fetch(`${targetUrl}?type=read_data&t=${ts}`, {credentials: 'omit'});
      const dataJson = await dataRes.json();
      
      const fixId = (arr: any[], prefix: string) => (arr || []).map((item: any, i: number) => ({ ...item, id: (item.id && String(item.id).trim().length > 0) ? String(item.id) : `${prefix}-${ts}-${i}`, peso: Number(item.peso)||0, preco: Number(item.preco)||0, venda: Number(item.venda)||0, lucro: Number(item.lucro)||0, valor: Number(item.valor)||0 }));
      
      setData({ estoque: fixId(dataJson.estoque, 'st'), vendas: fixId(dataJson.vendas, 've'), gastos: fixId(dataJson.gastos, 'ga') });
      showToast('Dados sincronizados!');
    } catch (err: any) {
      console.error(err);
      setLastError('Erro de conexão ou CORS. Usando dados offline.');
      showToast('Erro de conexão. Usando offline.');
      setData(MOCK_DATA);
    } finally { setLoading(false); }
  }, [apiUrl]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const apiCall = async (params: URLSearchParams) => {
    if(!apiUrl) return;
    try { await fetch(`${apiUrl}?${params.toString()}`, { method: 'POST', mode: 'no-cors', credentials: 'omit' }); } 
    catch(e) { console.error(e); }
  };

  const handleSaveSettings = async (ns: Settings) => {
    setSettings(ns);
    const p = new URLSearchParams({ type: 'save_settings' });
    Object.entries(ns).forEach(([k, v]) => p.append(k, v.toString()));
    await apiCall(p); showToast('Configurações salvas!');
  };
  const handleAddStock = (n:string,m:string,p:number,pr:number,c:string,t:string) => {
    const id=Date.now().toString(); setData(prev=>({...prev, estoque:[...prev.estoque, {id,nome:n,marca:m,peso:p,preco:pr,cor:c,tipo:t}]}));
    apiCall(new URLSearchParams({type:'estoque',action:'create',id,nome:n,marca:m,peso:p.toString(),preco:pr.toString(),cor:c,tipo:t})); showToast('Adicionado!');
  };
  const handleUpdateStock = (id:string,u:any) => {
    setData(prev=>({...prev, estoque:prev.estoque.map(i=>i.id===id?{...i,...u}:i)}));
    const f=data.estoque.find(i=>i.id===id); if(f) apiCall(new URLSearchParams({type:'estoque',action:'update',id,nome:u.nome||f.nome,marca:u.marca||f.marca||'',peso:(u.peso||f.peso).toString(),preco:(u.preco||f.preco).toString(),cor:u.cor||f.cor||'',tipo:u.tipo||f.tipo||''})); showToast('Atualizado!');
  };
  const handleDeleteStock = (id:string) => {
    setData(prev=>({...prev, estoque:prev.estoque.filter(i=>i.id!==id)})); apiCall(new URLSearchParams({type:'estoque',action:'delete',id})); showToast('Removido!');
  };
  const handleAddSale = (i:string,m:string,p:number,v:number,l:number) => {
    const id=Date.now().toString(); setData(prev=>({...prev, vendas:[{id,data:new Date().toISOString().split('T')[0],item:i,material:m,peso:p,venda:v,lucro:l},...prev.vendas]}));
    apiCall(new URLSearchParams({type:'venda',id,item:i,material:m,peso:p.toString(),venda:v.toFixed(2),lucro:l.toFixed(2)})); showToast('Venda registrada!'); setView(ViewState.TRANSACTIONS);
  };
  const handleUpdateSale = (id:string,v:number,l:number) => {
    setData(prev=>({...prev, vendas:prev.vendas.map(s=>s.id===id?{...s,venda:v,lucro:l}:s)}));
    const s=data.vendas.find(i=>i.id===id); if(s) apiCall(new URLSearchParams({type:'venda',action:'update',id,data:s.data,item:s.item,material:s.material,peso:s.peso.toString(),venda:v.toFixed(2),lucro:l.toFixed(2)})); showToast('Atualizado!');
  };
  const handleDeleteSale = (id:string) => { setData(prev=>({...prev, vendas:prev.vendas.filter(s=>s.id!==id)})); apiCall(new URLSearchParams({type:'venda',action:'delete',id})); showToast('Removido!'); };
  const handleAddExpense = (d:string,v:number,dt:string) => {
    // PROTEÇÃO EXTRA RIGOROSA
    if (!d || typeof d !== 'string' || d.trim().length === 0) { console.warn('Tentativa de criar gasto sem descrição'); return; }
    if (v === undefined || v === null || isNaN(v) || v <= 0) { console.warn('Tentativa de criar gasto sem valor'); return; }
    
    const id=Date.now().toString(); setData(prev=>({...prev, gastos:[{id,descricao:d,valor:v,data:dt},...prev.gastos]}));
    apiCall(new URLSearchParams({type:'gasto',action:'create',id,data:dt,descricao:d,valor:v.toString()})); showToast('Gasto registrado!');
  };
  const handleUpdateExpense = (id:string,d:string,v:number) => {
    setData(prev=>({...prev, gastos:prev.gastos.map(g=>g.id===id?{...g,descricao:d,valor:v}:g)}));
    const g=data.gastos.find(i=>i.id===id); if(g) apiCall(new URLSearchParams({type:'gasto',action:'update',id,data:g.data,descricao:d,valor:v.toString()})); showToast('Atualizado!');
  };
  const handleDeleteExpense = (id:string) => { 
    if(!id) return;
    setData(prev=>({...prev, gastos:prev.gastos.filter(g=>g.id!==id)})); 
    apiCall(new URLSearchParams({type:'gasto',action:'delete',id})); 
    showToast('Removido!'); 
  };

  const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
  const IconCalc = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>;
  const IconBox = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
  const IconList = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
  const IconSettings = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
  const NavButton = ({ v, icon: Icon, label }: any) => (<button onClick={() => setView(v)} className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${view === v ? 'text-primary scale-110' : 'text-secondary hover:text-primary/70'}`}><Icon /><span className="text-[10px] mt-1 font-bold">{label}</span></button>);

  return (
    <div className="min-h-screen bg-dark text-slate-600 font-sans selection:bg-primary selection:text-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-emerald-100 p-4 z-20 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center -space-x-1.5 select-none"><span className="text-4xl font-black text-primary tracking-tighter">3</span><span className="text-4xl font-black text-emerald-300 tracking-tighter z-10">3</span><span className="text-4xl font-black text-primary tracking-tighter">3</span></div>
        </div>
        {loading && <div className="w-5 h-5 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>}
      </header>
      <main className="p-4 max-w-lg mx-auto">
        {view === ViewState.DASHBOARD && <DashboardView data={data} onNavigate={setView} />}
        {view === ViewState.CALCULATOR && <Calculator settings={settings} stock={data.estoque} onSaveSale={handleAddSale} />}
        {view === ViewState.INVENTORY && <InventoryView stock={data.estoque} onAddStock={handleAddStock} onUpdateStock={handleUpdateStock} onDeleteStock={handleDeleteStock} />}
        {view === ViewState.TRANSACTIONS && <TransactionsView sales={data.vendas} expenses={data.gastos} onUpdateSale={handleUpdateSale} onDeleteSale={handleDeleteSale} onAddExpense={handleAddExpense} onUpdateExpense={handleUpdateExpense} onDeleteExpense={handleDeleteExpense} />}
        {view === ViewState.SETTINGS && <SettingsView settings={settings} onSave={handleSaveSettings} apiUrl={apiUrl} onUrlChange={(u: string) => { setApiUrl(u); localStorage.setItem('APPS_SCRIPT_URL', u); }} lastError={lastError} onRetry={fetchData} />}
      </main>
      <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur border-t border-emerald-100 pb-safe z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
        <div className="flex justify-around max-w-lg mx-auto pt-1">
          <NavButton v={ViewState.DASHBOARD} icon={IconHome} label="Início" />
          <NavButton v={ViewState.CALCULATOR} icon={IconCalc} label="Calc" />
          <NavButton v={ViewState.INVENTORY} icon={IconBox} label="Estoque" />
          <NavButton v={ViewState.TRANSACTIONS} icon={IconList} label="Finanças" />
          <NavButton v={ViewState.SETTINGS} icon={IconSettings} label="Config" />
        </div>
      </nav>
      {toast && (<div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white text-slate-700 px-6 py-3 rounded-full shadow-xl text-sm border border-emerald-100 z-50 animate-bounce font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span>{toast}</div>)}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) { ReactDOM.createRoot(rootElement).render(<App />); }
