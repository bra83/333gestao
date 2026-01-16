
import React, { useState, useEffect } from 'react';
import { Settings, StockItem } from '../types';

interface SelectedFilament {
  stockIdx: number;
  weight: number;
}

interface CalculatorProps {
  settings: Settings;
  stock: StockItem[];
  onSaveSale: (item: string, materials: {name: string, weight: number, stockId: string}[], totalPrice: number, totalProfit: number) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ settings, stock, onSaveSale }) => {
  const [itemName, setItemName] = useState<string>('');
  const [selectedFilaments, setSelectedFilaments] = useState<SelectedFilament[]>([{ stockIdx: 0, weight: 0 }]);
  const [hours, setHours] = useState<number>(0);
  const [paintingType, setPaintingType] = useState<'none' | 'simple' | 'medium' | 'pro'>('none');
  const [prepTime, setPrepTime] = useState<number>(settings.tempoPreparacao || 15);
  const [postTime, setPostTime] = useState<number>(settings.tempoPosProcessamento || 15);
  const [failRate, setFailRate] = useState<number>(settings.risco || 10);
  
  const [costs, setCosts] = useState({
    materialTotal: 0, energyTotal: 0, machineTotal: 0, laborTotal: 0, fixedTotal: 0, servicesTotal: 0, subtotal: 0, riskValue: 0, totalCost: 0, finalPrice: 0, profit: 0, totalWeight: 0
  });

  useEffect(() => {
    if (stock.length === 0) return;

    let totalMaterialCost = 0;
    let totalWeight = 0;

    selectedFilaments.forEach(sel => {
      const filament = stock[sel.stockIdx];
      if (filament && sel.weight > 0) {
        const base = (sel.weight / 1000) * filament.preco;
        const loss = base * ((settings.perdaMaterial || 5) / 100);
        totalMaterialCost += (base + loss);
        totalWeight += sel.weight;
      }
    });

    const safeKwh = settings.kwh || 0.95;
    const safeVidaUtil = (settings.vidaUtilHoras && settings.vidaUtilHoras > 0) ? settings.vidaUtilHoras : 8000;
    const safeHorasTrab = (settings.horasTrab && settings.horasTrab > 0) ? settings.horasTrab : 160;
    const safeEficiencia = (settings.eficienciaFonte && settings.eficienciaFonte > 0) ? settings.eficienciaFonte : 0.9;
    const safePrecoMaq = settings.precoMaq || 3500;
    const safeValorHora = settings.valorHoraTrabalho || 20;

    const powerKW = (settings.potencia / 1000);
    const energyConsumption = (powerKW * hours) / safeEficiencia;
    const energyTotal = energyConsumption * safeKwh;

    const depreciationPerHour = safePrecoMaq / safeVidaUtil;
    const maintenancePerHour = (settings.manutencaoMensal || 20) / safeHorasTrab;
    const machineTotal = (depreciationPerHour + maintenancePerHour) * hours;

    const totalLaborMinutes = prepTime + postTime + (settings.tempoAtendimento || 10); 
    const laborTotal = (totalLaborMinutes / 60) * safeValorHora;

    const totalMonthlyFixed = (settings.aluguel || 0) + (settings.mei || 0) + (settings.softwares || 0) + (settings.ecommerce || 0) + (settings.publicidade || 0) + (settings.condominio || 0);
    const fixedCostPerHour = totalMonthlyFixed / safeHorasTrab;
    const fixedTotal = fixedCostPerHour * hours;

    let paintCost = 0;
    if (paintingType === 'simple') paintCost = settings.pintSimples;
    if (paintingType === 'medium') paintCost = settings.pintMedia;
    if (paintingType === 'pro') paintCost = settings.pintProf;
    const servicesTotal = (settings.embalagem || 0) + paintCost;

    const subtotal = totalMaterialCost + energyTotal + machineTotal + laborTotal + fixedTotal + servicesTotal;
    const riskPct = failRate / 100;
    const riskValue = subtotal * riskPct;
    const totalCost = subtotal + riskValue;
    const finalPrice = totalCost * (settings.markup || 3);
    const profit = finalPrice - totalCost;

    const safeNum = (n: number) => (isFinite(n) && !isNaN(n)) ? n : 0;
    setCosts({
      materialTotal: safeNum(totalMaterialCost), energyTotal: safeNum(energyTotal), machineTotal: safeNum(machineTotal),
      laborTotal: safeNum(laborTotal), fixedTotal: safeNum(fixedTotal), servicesTotal: safeNum(servicesTotal),
      subtotal: safeNum(subtotal), riskValue: safeNum(riskValue), totalCost: safeNum(totalCost),
      finalPrice: safeNum(finalPrice), profit: safeNum(profit), totalWeight: safeNum(totalWeight)
    });
  }, [selectedFilaments, hours, paintingType, settings, stock, prepTime, postTime, failRate]);

  const addFilamentSlot = () => {
    if (selectedFilaments.length < 8) {
      setSelectedFilaments([...selectedFilaments, { stockIdx: 0, weight: 0 }]);
    }
  };

  const removeFilamentSlot = (index: number) => {
    if (selectedFilaments.length > 1) {
      setSelectedFilaments(selectedFilaments.filter((_, i) => i !== index));
    }
  };

  const updateFilament = (index: number, updates: Partial<SelectedFilament>) => {
    setSelectedFilaments(selectedFilaments.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const handleSave = () => {
    if (!itemName) return alert('Nome do Projeto obrigatÃ³rio!');
    if (costs.totalWeight <= 0) return alert('Adicione peso aos filamentos!');

    const materialsData = selectedFilaments
      .filter(f => f.weight > 0)
      .map(f => {
        const s = stock[f.stockIdx];
        return {
          name: s.marca ? `${s.nome} (${s.marca})` : s.nome,
          weight: f.weight,
          stockId: s.id!
        };
      });

    onSaveSale(itemName, materialsData, costs.finalPrice, costs.profit);
    setItemName(''); 
    setSelectedFilaments([{ stockIdx: 0, weight: 0 }]); 
    setHours(0);
  };

  if (stock.length === 0) return <div className="jewelry-card p-12 text-center font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border-dashed border-2">Sem filamentos no cofre!</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="jewelry-card p-6 shadow-sm border-slate-200">
        <h2 className="text-slate-900 font-black text-xl uppercase mb-6 tracking-tighter border-b-2 border-slate-100 pb-3 flex items-center gap-2">
          <span className="w-2 h-6 jewel-gradient-amethyst rounded-full"></span>
          Mesa de CriaÃ§Ã£o
        </h2>
        
        <div className="space-y-6">
          <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
            <label className="block text-[11px] font-black uppercase text-slate-500 mb-2 ml-1 tracking-widest">Nome do Projeto</label>
            <input type="text" className="w-full p-4 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Ex: Pingente Ouro 3D" />
          </div>

          <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
            <div className="flex justify-between items-center mb-3 px-1">
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Materiais e Cores</label>
              <button onClick={addFilamentSlot} disabled={selectedFilaments.length >= 8} className="text-[11px] font-black uppercase text-amethyst-600 bg-amethyst-50 px-3 py-1 rounded-full hover:bg-amethyst-100 transition-colors disabled:opacity-30">
                + Nova Cor
              </button>
            </div>
            
            <div className="space-y-3">
              {selectedFilaments.map((sel, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-left-2 duration-200">
                  <div className="flex-[3]">
                    <select className="w-full p-3 rounded-xl text-xs font-bold text-slate-900 border-none bg-transparent" value={sel.stockIdx} onChange={e => updateFilament(idx, { stockIdx: Number(e.target.value) })}>
                      {stock.map((item, sIdx) => (<option key={sIdx} value={sIdx}>{item.nome} ({item.tipo})</option>))}
                    </select>
                  </div>
                  <div className="flex-[2]">
                    <input type="number" placeholder="Peso (g)" className="w-full p-3 rounded-xl text-xs font-bold text-slate-900 border-none bg-transparent" value={sel.weight || ''} onChange={e => updateFilament(idx, { weight: Number(e.target.value) })} />
                  </div>
                  {selectedFilaments.length > 1 && (
                    <button onClick={() => removeFilamentSlot(idx)} className="w-10 h-10 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
              <label className="block text-[11px] font-black uppercase text-slate-500 mb-2 ml-1 tracking-widest">Tempo (Horas)</label>
              <input type="number" className="w-full p-4 rounded-2xl text-slate-900 font-bold" value={hours || ''} onChange={e => setHours(Number(e.target.value))} placeholder="0.0" />
            </div>
            <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
              <label className="block text-[11px] font-black uppercase text-slate-500 mb-2 ml-1 tracking-widest">Acabamento</label>
              <select className="w-full p-4 rounded-2xl text-xs font-bold text-slate-900" value={paintingType} onChange={e => setPaintingType(e.target.value as any)}>
                <option value="none">Nenhum</option>
                <option value="simple">Simples</option>
                <option value="medium">MÃ©dio</option>
                <option value="pro">Profissional</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="jewelry-card overflow-hidden bg-slate-900 border-0 shadow-2xl">
        <div className="jewel-gradient-amethyst p-5 text-center">
            <h3 className="text-white font-black uppercase tracking-[0.4em] text-[10px]">RelatÃ³rio de Custos</h3>
        </div>
        
        <div className="p-8 space-y-4 text-sm font-semibold text-slate-400">
          <Row label="Gemas (Materiais)" value={costs.materialTotal} sub={`${costs.totalWeight}g totais`} />
          <Row label="Corrente ElÃ©trica" value={costs.energyTotal} />
          <Row label="Desgaste MÃ¡quina" value={costs.machineTotal} />
          <Row label="MÃ£o de Obra" value={costs.laborTotal} />
          <Row label="Custos de Guilda" value={costs.fixedTotal} />
          
          <div className="border-t border-white/10 my-6 pt-4">
            <div className="flex justify-between text-lg text-white font-black tracking-tighter">
              <span className="uppercase text-xs tracking-widest text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amethyst-500 animate-pulse"></span>
                Custo de ProduÃ§Ã£o
              </span>
              <span>R$ {costs.totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 p-8 text-center border-t border-white/10 backdrop-blur-sm">
            <span className="block text-[10px] text-amethyst-400 uppercase tracking-[0.2em] font-black mb-2">PreÃ§o de Venda Sugerido</span>
            <div className="text-6xl font-black text-white mb-3 tracking-tighter">
              <span className="text-2xl align-top mr-1 text-amethyst-500">R$</span>
              {costs.finalPrice.toFixed(2)}
            </div>
            <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-full inline-block">
              Lucro Estimado: +R$ {costs.profit.toFixed(2)}
            </div>

            <button onClick={handleSave} className="w-full mt-8 jewel-gradient-emerald text-white font-black uppercase py-5 rounded-[28px] text-xs tracking-[0.3em] shadow-[0_20px_40px_-15px_rgba(16,185,129,0.5)] active:scale-95 transition-all">
              FINALIZAR PROJETO
            </button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, sub }: { label: string, value: number, sub?: string }) => (
  <div className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0">
    <div className="flex flex-col">
      <span className="uppercase text-[10px] tracking-widest text-slate-500">{label}</span>
      {sub && <span className="text-[9px] text-amethyst-400/60 font-bold">{sub}</span>}
    </div>
    <span className="text-slate-100 font-mono">R$ {value.toFixed(2)}</span>
  </div>
);
