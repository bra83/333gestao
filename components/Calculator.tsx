import React, { useState, useEffect } from 'react';
import { Settings, StockItem } from '../types';

interface CalculatorProps {
  settings: Settings;
  stock: StockItem[];
  onSaveSale: (item: string, material: string, weight: number, price: number, profit: number, stockId?: string) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ settings, stock, onSaveSale }) => {
  const [mode, setMode] = useState<'basic' | 'advanced'>('advanced');
  
  // Inputs
  const [selectedFilamentIdx, setSelectedFilamentIdx] = useState<number>(0);
  const [itemName, setItemName] = useState<string>('');
  const [weight, setWeight] = useState<number>(0); // g
  const [hours, setHours] = useState<number>(0); // h
  const [paintingType, setPaintingType] = useState<'none' | 'simple' | 'medium' | 'pro'>('none');
  const [prepTime, setPrepTime] = useState<number>(settings.tempoPreparacao || 15); // min
  const [postTime, setPostTime] = useState<number>(settings.tempoPosProcessamento || 15); // min
  const [failRate, setFailRate] = useState<number>(settings.risco || 10); // %

  // Output State
  const [costs, setCosts] = useState({
    materialTotal: 0,
    energyTotal: 0,
    machineTotal: 0,
    laborTotal: 0,
    fixedTotal: 0,
    servicesTotal: 0,
    subtotal: 0,
    riskValue: 0,
    totalCost: 0,
    finalPrice: 0,
    profit: 0
  });

  useEffect(() => {
    if (stock.length === 0) return;
    const filament = stock[selectedFilamentIdx];
    if (!filament) return;

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
    const totalLaborMinutes = mode === 'advanced' 
      ? (prepTime + postTime + (settings.tempoAtendimento || 10))
      : 0; 
    const laborTotal = (totalLaborMinutes / 60) * laborHourlyRate;

    const totalMonthlyFixed = 
      settings.aluguel + settings.mei + settings.softwares + 
      settings.ecommerce + settings.publicidade + settings.condominio;
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

    setCosts({
      materialTotal, energyTotal, machineTotal, laborTotal, fixedTotal, 
      servicesTotal, subtotal, riskValue, totalCost, finalPrice, profit
    });

  }, [weight, hours, paintingType, selectedFilamentIdx, settings, stock, mode, prepTime, postTime, failRate]);

  const handleSave = () => {
    if (!itemName) return alert('Digite o nome do item');
    const filament = stock[selectedFilamentIdx];
    
    const materialName = filament.marca ? `${filament.nome} (${filament.marca})` : filament.nome;
    
    if (window.confirm(`Registrar venda de "${itemName}" por R$ ${costs.finalPrice.toFixed(2)}?`)) {
      // Passa o ID para dedução
      onSaveSale(itemName, materialName, weight, costs.finalPrice, costs.profit, filament.id);
      
      setItemName('');
      setWeight(0);
      setHours(0);
    }
  };

  if (stock.length === 0) return <div className="p-8 text-center text-secondary">Adicione filamentos ao estoque primeiro.</div>;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Toggle Mode */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-emerald-100 shadow-sm">
        <button 
          onClick={() => setMode('basic')}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${mode === 'basic' ? 'bg-slate-100 text-slate-700 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Básico
        </button>
        <button 
          onClick={() => setMode('advanced')}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${mode === 'advanced' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Avançado 🧠
        </button>
      </div>

      <div className="bg-surface p-5 rounded-2xl shadow-sm border border-emerald-100">
        <h2 className="text-lg font-bold text-slate-700 mb-4">Parâmetros</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs text-secondary mb-1 font-bold ml-1">NOME DO PROJETO</label>
            <input 
              type="text" 
              className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all font-semibold"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1 font-bold ml-1">FILAMENTO</label>
            <select 
              className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-primary/50 text-sm"
              value={selectedFilamentIdx}
              onChange={e => setSelectedFilamentIdx(Number(e.target.value))}
            >
              {stock.map((item, idx) => (
                <option key={idx} value={idx}>{item.nome} {item.marca ? `(${item.marca})` : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1 font-bold ml-1">ACABAMENTO</label>
            <select 
              className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-slate-700 focus:outline-none focus:border-primary/50 text-sm"
              value={paintingType}
              onChange={e => setPaintingType(e.target.value as any)}
            >
              <option value="none">Nenhum</option>
              <option value="simple">Simples (+R$ {settings.pintSimples})</option>
              <option value="medium">Médio (+R$ {settings.pintMedia})</option>
              <option value="pro">Profissional (+R$ {settings.pintProf})</option>
            </select>
          </div>

          <div className="flex gap-4">
             <div className="flex-1">
                <label className="block text-xs text-secondary mb-1 font-bold ml-1">PESO (g)</label>
                <input 
                  type="number" 
                  className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-primary font-black text-xl focus:outline-none focus:border-primary/50"
                  value={weight || ''}
                  onChange={e => setWeight(Number(e.target.value))}
                />
             </div>
             <div className="flex-1">
                <label className="block text-xs text-secondary mb-1 font-bold ml-1">TEMPO (h)</label>
                <input 
                  type="number" 
                  className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-primary font-black text-xl focus:outline-none focus:border-primary/50"
                  value={hours || ''}
                  onChange={e => setHours(Number(e.target.value))}
                />
             </div>
          </div>

          {mode === 'advanced' && (
            <div className="col-span-1 md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
              <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase">Detalhes Técnicos</h4>
              <div className="grid grid-cols-3 gap-3">
                 <div>
                   <label className="text-[10px] text-slate-400 block font-bold mb-1">PREP (MIN)</label>
                   <input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-700 text-sm font-bold" value={prepTime} onChange={e => setPrepTime(Number(e.target.value))} />
                 </div>
                 <div>
                   <label className="text-[10px] text-slate-400 block font-bold mb-1">PÓS (MIN)</label>
                   <input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-700 text-sm font-bold" value={postTime} onChange={e => setPostTime(Number(e.target.value))} />
                 </div>
                 <div>
                   <label className="text-[10px] text-slate-400 block font-bold mb-1">RISCO (%)</label>
                   <input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-700 text-sm font-bold" value={failRate} onChange={e => setFailRate(Number(e.target.value))} />
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result Card */}
      <div className="bg-surface p-6 rounded-2xl shadow-md border border-emerald-200 relative overflow-hidden">
        <h3 className="text-lg font-bold text-slate-700 mb-4 border-b border-emerald-100 pb-2 flex justify-between">
          <span>Detalhamento</span>
          <span className="text-xs bg-emerald-100 text-primary px-2 py-1 rounded-full">{mode === 'advanced' ? 'Completo' : 'Simples'}</span>
        </h3>
        
        <div className="space-y-2 text-sm">
          <Row label="1. Material (c/ perda)" value={costs.materialTotal} />
          <Row label="2. Energia" value={costs.energyTotal} />
          <Row label="3. Máquina (Deprec/Manut)" value={costs.machineTotal} color="text-slate-400" />
          <Row label="4. Mão de Obra" value={costs.laborTotal} color={mode === 'basic' ? 'text-slate-300 line-through' : 'text-blue-400'} />
          <Row label="5. Custos Fixos (Hora)" value={costs.fixedTotal} />
          <Row label="6. Serviços (Pint/Emb)" value={costs.servicesTotal} />
          <Row label="7. Risco Operacional" value={costs.riskValue} color={mode === 'basic' ? 'text-slate-300 line-through' : 'text-orange-400'} />
          
          <div className="border-t border-dashed border-slate-200 my-3 pt-1"></div>
          
          <div className="flex justify-between text-base font-bold">
            <span className="text-slate-500">Custo Total</span>
            <span className="text-slate-500">R$ {costs.totalCost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-400 to-primary p-6 rounded-2xl shadow-xl shadow-emerald-200 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 pointer-events-none"></div>
        <span className="block text-xs text-white/80 uppercase tracking-widest font-bold mb-1">Preço Final Sugerido</span>
        <div className="text-5xl font-black text-white mb-2 tracking-tight">
          R$ {costs.finalPrice.toFixed(2)}
        </div>
        <div className="text-white text-sm font-bold bg-white/20 inline-block px-4 py-1.5 rounded-full backdrop-blur-sm">
          Lucro Líquido: R$ {costs.profit.toFixed(2)}
        </div>

        <button 
          onClick={handleSave}
          className="mt-6 w-full bg-white text-primary font-black py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform active:scale-95"
        >
          REGISTRAR VENDA
        </button>
      </div>
    </div>
  );
};

const Row = ({ label, value, color = 'text-slate-600' }: { label: string, value: number, color?: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-slate-400 text-xs font-semibold">{label}</span>
    <span className={`font-mono font-bold ${color}`}>R$ {value.toFixed(2)}</span>
  </div>
);
