
import React, { useState, useEffect } from 'react';
import { Settings, StockItem } from '../types';

interface CalculatorProps {
  settings: Settings;
  stock: StockItem[];
  onSaveSale: (item: string, material: string, weight: number, price: number, profit: number, stockId?: string) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ settings, stock, onSaveSale }) => {
  const [mode, setMode] = useState<'basic' | 'advanced'>('advanced');
  const [selectedFilamentIdx, setSelectedFilamentIdx] = useState<number>(0);
  const [itemName, setItemName] = useState<string>('');
  const [weight, setWeight] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [paintingType, setPaintingType] = useState<'none' | 'simple' | 'medium' | 'pro'>('none');
  const [prepTime, setPrepTime] = useState<number>(settings.tempoPreparacao || 15);
  const [postTime, setPostTime] = useState<number>(settings.tempoPosProcessamento || 15);
  const [failRate, setFailRate] = useState<number>(settings.risco || 10);
  const [costs, setCosts] = useState({
    materialTotal: 0, energyTotal: 0, machineTotal: 0, laborTotal: 0, fixedTotal: 0, servicesTotal: 0, subtotal: 0, riskValue: 0, totalCost: 0, finalPrice: 0, profit: 0
  });

  useEffect(() => {
    if (stock.length === 0) return;
    const filament = stock[selectedFilamentIdx];
    if (!filament) return;

    const safeKwh = settings.kwh || 0.95;
    const safeVidaUtil = (settings.vidaUtilHoras && settings.vidaUtilHoras > 0) ? settings.vidaUtilHoras : 8000;
    const safeHorasTrab = (settings.horasTrab && settings.horasTrab > 0) ? settings.horasTrab : 160;
    const safeEficiencia = (settings.eficienciaFonte && settings.eficienciaFonte > 0) ? settings.eficienciaFonte : 0.9;
    const safePrecoMaq = settings.precoMaq || 3500;
    const safeValorHora = settings.valorHoraTrabalho || 20;

    const materialBase = (weight / 1000) * filament.preco;
    const materialLoss = materialBase * ((settings.perdaMaterial || 5) / 100);
    const materialTotal = materialBase + materialLoss;

    const powerKW = (settings.potencia / 1000);
    const energyConsumption = (powerKW * hours) / safeEficiencia;
    const energyTotal = energyConsumption * safeKwh;

    const depreciationPerHour = safePrecoMaq / safeVidaUtil;
    const maintenancePerHour = (settings.manutencaoMensal || 20) / safeHorasTrab;
    const machineTotal = (depreciationPerHour + maintenancePerHour) * hours;

    const totalLaborMinutes = mode === 'advanced' ? (prepTime + postTime + (settings.tempoAtendimento || 10)) : 0; 
    const laborTotal = (totalLaborMinutes / 60) * safeValorHora;

    // Fixed Costs Calculation (Now including Internet)
    const totalMonthlyFixed = settings.aluguel + settings.mei + settings.softwares + settings.ecommerce + settings.publicidade + settings.condominio + (settings.internet || 0);
    const fixedCostPerHour = totalMonthlyFixed / safeHorasTrab;
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
    const finalPrice = totalCost * (settings.markup || 3);
    const profit = finalPrice - totalCost;

    const safeNum = (n: number) => (isFinite(n) && !isNaN(n)) ? n : 0;
    setCosts({
      materialTotal: safeNum(materialTotal), energyTotal: safeNum(energyTotal), machineTotal: safeNum(machineTotal),
      laborTotal: safeNum(laborTotal), fixedTotal: safeNum(fixedTotal), servicesTotal: safeNum(servicesTotal),
      subtotal: safeNum(subtotal), riskValue: safeNum(riskValue), totalCost: safeNum(totalCost),
      finalPrice: safeNum(finalPrice), profit: safeNum(profit)
    });
  }, [weight, hours, paintingType, selectedFilamentIdx, settings, stock, mode, prepTime, postTime, failRate]);

  const handleSave = () => {
    if (!itemName) return alert('Nome do projeto obrigatório!');
    const filament = stock[selectedFilamentIdx];
    const materialName = filament.marca ? `${filament.nome} (${filament.marca})` : filament.nome;
    if (window.confirm(`Registrar venda de "${itemName}" por R$ ${costs.finalPrice.toFixed(2)}?`)) {
      onSaveSale(itemName, materialName, weight, costs.finalPrice, costs.profit, filament.id);
      setItemName(''); setWeight(0); setHours(0);
    }
  };

  if (stock.length === 0) return <div className="app-card p-8 text-center text-slate-500">Nenhum item no estoque!</div>;

  return (
    <div className="space-y-6">
      
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button onClick={() => setMode('basic')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'basic' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}>Básico</button>
        <button onClick={() => setMode('advanced')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'advanced' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}>Avançado</button>
      </div>

      <div className="app-card p-5">
        <h2 className="text-primary font-bold text-lg mb-4">Novo Orçamento</h2>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Projeto</label>
            <input type="text" className="app-input w-full" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Nome da peça" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Material</label>
            <select className="app-input w-full bg-white" value={selectedFilamentIdx} onChange={e => setSelectedFilamentIdx(Number(e.target.value))}>
              {stock.map((item, idx) => (<option key={idx} value={idx}>{item.nome} - R${item.preco}/kg</option>))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Acabamento</label>
            <select className="app-input w-full bg-white" value={paintingType} onChange={e => setPaintingType(e.target.value as any)}>
              <option value="none">Nenhum</option>
              <option value="simple">Simples (+R${settings.pintSimples})</option>
              <option value="medium">Médio (+R${settings.pintMedia})</option>
              <option value="pro">Profissional (+R${settings.pintProf})</option>
            </select>
          </div>

          <div className="flex gap-4">
             <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Peso (g)</label>
                <input type="number" className="app-input w-full text-lg font-bold text-primary" value={weight || ''} onChange={e => setWeight(Number(e.target.value))} />
             </div>
             <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Tempo (h)</label>
                <input type="number" className="app-input w-full text-lg font-bold text-primary" value={hours || ''} onChange={e => setHours(Number(e.target.value))} />
             </div>
          </div>
        </div>
      </div>

      <div className="app-card p-0 overflow-hidden border-primary/20">
        <div className="bg-slate-50 p-4 border-b border-slate-100">
            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">Detalhamento</h3>
        </div>
        
        <div className="p-5 space-y-3 text-sm text-slate-600">
          <Row label="Material" value={costs.materialTotal} />
          <Row label="Energia" value={costs.energyTotal} />
          <Row label="Depreciação" value={costs.machineTotal} />
          <Row label="Mão de Obra" value={costs.laborTotal} />
          <Row label="Custos Fixos" value={costs.fixedTotal} />
          <Row label="Acabamento/Emb." value={costs.servicesTotal} />
          <Row label="Margem de Risco" value={costs.riskValue} />
          
          <div className="border-t border-slate-100 my-2 pt-2"></div>
          
          <div className="flex justify-between text-base font-bold text-primary">
            <span>Custo Total</span>
            <span>R$ {costs.totalCost.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="bg-primary p-6 text-center text-white">
            <span className="block text-xs text-blue-200 font-bold uppercase tracking-wider mb-1">Preço Sugerido</span>
            <div className="text-5xl font-extrabold mb-2 tracking-tight">
            R$ {costs.finalPrice.toFixed(2)}
            </div>
            <div className="text-blue-200 text-sm font-medium bg-white/10 inline-block px-3 py-1 rounded-full">
            Lucro Estimado: R$ {costs.profit.toFixed(2)}
            </div>

            <button onClick={handleSave} className="app-btn mt-6 w-full bg-white text-primary py-4 shadow-lg hover:bg-blue-50">
            Registrar Venda
            </button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string, value: number }) => (
  <div className="flex justify-between items-center">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold">R$ {value.toFixed(2)}</span>
  </div>
);
