
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
  const [mode, setMode] = useState<'basic' | 'advanced'>('advanced');
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

    const totalLaborMinutes = mode === 'advanced' ? (prepTime + postTime + (settings.tempoAtendimento || 10)) : 0; 
    const laborTotal = (totalLaborMinutes / 60) * safeValorHora;

    const totalMonthlyFixed = settings.aluguel + settings.mei + settings.softwares + settings.ecommerce + settings.publicidade + settings.condominio;
    const fixedCostPerHour = totalMonthlyFixed / safeHorasTrab;
    const fixedTotal = fixedCostPerHour * hours;

    let paintCost = 0;
    if (paintingType === 'simple') paintCost = settings.pintSimples;
    if (paintingType === 'medium') paintCost = settings.pintMedia;
    if (paintingType === 'pro') paintCost = settings.pintProf;
    const servicesTotal = (settings.embalagem || 0) + paintCost;

    const subtotal = totalMaterialCost + energyTotal + machineTotal + laborTotal + fixedTotal + servicesTotal;
    const riskPct = mode === 'advanced' ? (failRate / 100) : 0;
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
  }, [selectedFilaments, hours, paintingType, settings, stock, mode, prepTime, postTime, failRate]);

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
    if (!itemName) return alert('Nome do Projeto obrigatório!');
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

    if (window.confirm(`Vender "${itemName}" por R$ ${costs.finalPrice.toFixed(2)}?`)) {
      onSaveSale(itemName, materialsData, costs.finalPrice, costs.profit);
      setItemName(''); 
      setSelectedFilaments([{ stockIdx: 0, weight: 0 }]); 
      setHours(0);
    }
  };

  if (stock.length === 0) return <div className="jewelry-card p-8 text-center font-black text-slate-400 uppercase">Sem filamentos no cofre!</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="jewelry-card p-6 bg-white">
        <h2 className="text-slate-900 font-black text-lg uppercase mb-4 tracking-tighter">Mesa de Criação</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Nome do Projeto</label>
            <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-2xl text-slate-900 font-bold focus:border-amethyst-500 outline-none transition-all" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Ex: Estátua Dragão" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Materiais (Até 8)</label>
              <button onClick={addFilamentSlot} disabled={selectedFilaments.length >= 8} className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-700 disabled:opacity-30">
                + Adicionar Cor
              </button>
            </div>
            
            {selectedFilaments.map((sel, idx) => (
              <div key={idx} className="flex gap-2 animate-in slide-in-from-left-2 duration-200">
                <div className="flex-[2]">
                  <select className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-2xl text-xs font-bold text-slate-900 outline-none" value={sel.stockIdx} onChange={e => updateFilament(idx, { stockIdx: Number(e.target.value) })}>
                    {stock.map((item, sIdx) => (<option key={sIdx} value={sIdx}>{item.nome} ({item.tipo})</option>))}
                  </select>
                </div>
                <div className="flex-1">
                  <input type="number" placeholder="g" className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-2xl text-xs font-bold text-slate-900 outline-none" value={sel.weight || ''} onChange={e => updateFilament(idx, { weight: Number(e.target.value) })} />
                </div>
                {selectedFilaments.length > 1 && (
                  <button onClick={() => removeFilamentSlot(idx)} className="w-11 h-11 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Tempo de Impressão (h)</label>
              <input type="number" className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-2xl text-slate-900 font-bold outline-none" value={hours || ''} onChange={e => setHours(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Acabamento</label>
              <select className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-2xl text-xs font-bold text-slate-900 outline-none" value={paintingType} onChange={e => setPaintingType(e.target.value as any)}>
                <option value="none">Nenhum</option>
                <option value="simple">Simples (+R${settings.pintSimples})</option>
                <option value="medium">Médio (+R${settings.pintMedia})</option>
                <option value="pro">Profissional (+R${settings.pintProf})</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="jewelry-card overflow-hidden bg-slate-900 border-0 shadow-2xl">
        <div className="jewel-gradient-amethyst p-4 text-center">
            <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs">Resultado da Forja</h3>
        </div>
        
        <div className="p-6 space-y-3 text-sm font-bold text-slate-300">
          <Row label="Material Total" value={costs.materialTotal} sub={`${costs.totalWeight}g`} />
          <Row label="Energia Elétrica" value={costs.energyTotal} />
          <Row label="Uso de Máquina" value={costs.machineTotal} />
          <Row label="Mão de Obra" value={costs.laborTotal} />
          <Row label="Custos Fixos" value={costs.fixedTotal} />
          <Row label="Riscos (Falhas)" value={costs.riskValue} />
          
          <div className="border-t border-white/10 my-4"></div>
          
          <div className="flex justify-between text-lg text-white font-black tracking-tighter">
            <span>CUSTO TOTAL</span>
            <span>R$ {costs.totalCost.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="bg-white/5 p-6 text-center border-t border-white/10">
            <span className="block text-[10px] text-amethyst-400 uppercase tracking-widest font-black mb-1">Preço Sugerido (Markup {settings.markup}x)</span>
            <div className="text-5xl font-black text-white mb-2 tracking-tighter">
              R$ {costs.finalPrice.toFixed(2)}
            </div>
            <div className="text-emerald-400 text-xs font-black uppercase tracking-widest">
              Lucro Estimado: R$ {costs.profit.toFixed(2)}
            </div>

            <button onClick={handleSave} className="w-full mt-6 jewel-gradient-emerald text-white font-black uppercase py-5 rounded-[24px] text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all">
              REGISTRAR VENDA
            </button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, sub }: { label: string, value: number, sub?: string }) => (
  <div className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
    <div className="flex flex-col">
      <span className="uppercase text-[10px] tracking-wider text-slate-500">{label}</span>
      {sub && <span className="text-[9px] text-slate-400 leading-none">{sub}</span>}
    </div>
    <span className="text-slate-100">R$ {value.toFixed(2)}</span>
  </div>
);
    const safeVidaUtil = num(settings.vidaUtilHoras, 8000) || 8000; // avoid 0 div
    const safeHorasTrab = num(settings.horasTrab, 160) || 160;
    const safeEficiencia = num(settings.eficienciaFonte, 0.9) || 0.9;
    const safePrecoMaq = num(settings.precoMaq, 3500);
    const safeValorHora = num(settings.valorHoraTrabalho, 20);

    const materialBase = (weight / 1000) * filament.preco;
    const materialLoss = materialBase * (num(settings.perdaMaterial, 5) / 100);
    const materialTotal = materialBase + materialLoss;

    const powerKW = (num(settings.potencia) / 1000);
    const energyConsumption = (powerKW * hours) / safeEficiencia;
    const energyTotal = energyConsumption * safeKwh;

    const depreciationPerHour = safePrecoMaq / safeVidaUtil;
    const maintenancePerHour = num(settings.manutencaoMensal, 20) / safeHorasTrab;
    const machineTotal = (depreciationPerHour + maintenancePerHour) * hours;

    const totalLaborMinutes = mode === 'advanced' ? (prepTime + postTime + num(settings.tempoAtendimento, 10)) : 0; 
    const laborTotal = (totalLaborMinutes / 60) * safeValorHora;

    // Fixed Costs Calculation (Now including Internet)
    const totalMonthlyFixed = num(settings.aluguel) + num(settings.mei) + num(settings.softwares) + num(settings.ecommerce) + num(settings.publicidade) + num(settings.condominio) + num(settings.internet);
    const fixedCostPerHour = totalMonthlyFixed / safeHorasTrab;
    const fixedTotal = fixedCostPerHour * hours;

    let paintCost = 0;
    if (paintingType === 'simple') paintCost = num(settings.pintSimples);
    if (paintingType === 'medium') paintCost = num(settings.pintMedia);
    if (paintingType === 'pro') paintCost = num(settings.pintProf);
    const servicesTotal = num(settings.embalagem) + paintCost;

    const subtotal = materialTotal + energyTotal + machineTotal + laborTotal + fixedTotal + servicesTotal;
    const riskPct = mode === 'advanced' ? (failRate / 100) : 0;
    const riskValue = subtotal * riskPct;
    const totalCost = subtotal + riskValue;
    const finalPrice = totalCost * num(settings.markup, 3);
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
              <option value="simple">Simples (+R${num(settings.pintSimples)})</option>
              <option value="medium">Médio (+R${num(settings.pintMedia)})</option>
              <option value="pro">Profissional (+R${num(settings.pintProf)})</option>
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
