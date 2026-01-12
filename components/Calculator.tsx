
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

    const totalMonthlyFixed = settings.aluguel + settings.mei + settings.softwares + settings.ecommerce + settings.publicidade + settings.condominio;
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
    if (!itemName) return alert('Nome da Quest obrigatório!');
    const filament = stock[selectedFilamentIdx];
    const materialName = filament.marca ? `${filament.nome} (${filament.marca})` : filament.nome;
    if (window.confirm(`Vender "${itemName}" por R$ ${costs.finalPrice.toFixed(2)}?`)) {
      onSaveSale(itemName, materialName, weight, costs.finalPrice, costs.profit, filament.id);
      setItemName(''); setWeight(0); setHours(0);
    }
  };

  if (stock.length === 0) return <div className="retro-box p-8 text-center font-pixel text-secondary uppercase">No Items in Inventory!</div>;

  return (
    <div className="space-y-6 pb-20">
      
      <div className="flex bg-secondary p-1 rounded-none border-2 border-bgDark shadow-[2px_2px_0_#000]">
        <button onClick={() => setMode('basic')} className={`flex-1 py-2 text-xs font-pixel uppercase transition-all ${mode === 'basic' ? 'bg-[#fcf9ee] text-bgDark' : 'text-[#d6c7b2]'}`}>Basic Mode</button>
        <button onClick={() => setMode('advanced')} className={`flex-1 py-2 text-xs font-pixel uppercase transition-all ${mode === 'advanced' ? 'bg-accent text-bgDark border-2 border-bgDark' : 'text-[#d6c7b2]'}`}>Advanced Mode</button>
      </div>

      <div className="retro-box p-5 bg-white">
        <h2 className="text-secondary font-pixel text-lg uppercase mb-4 border-b-2 border-secondary/20">Crafting Table</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[10px] font-bold uppercase text-secondary mb-1">Project Name</label>
            <input type="text" className="w-full bg-[#f0f0f0] border-2 border-[#ccc] p-2 text-bgDark font-bold focus:border-primary focus:outline-none" value={itemName} onChange={e => setItemName(e.target.value)} />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-secondary mb-1">Filament</label>
            <select className="w-full bg-[#f0f0f0] border-2 border-[#ccc] p-2 text-bgDark font-bold focus:border-primary focus:outline-none" value={selectedFilamentIdx} onChange={e => setSelectedFilamentIdx(Number(e.target.value))}>
              {stock.map((item, idx) => (<option key={idx} value={idx}>{item.nome}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-secondary mb-1">Finish</label>
            <select className="w-full bg-[#f0f0f0] border-2 border-[#ccc] p-2 text-bgDark font-bold focus:border-primary focus:outline-none" value={paintingType} onChange={e => setPaintingType(e.target.value as any)}>
              <option value="none">None</option>
              <option value="simple">Simple (+R${settings.pintSimples})</option>
              <option value="medium">Medium (+R${settings.pintMedia})</option>
              <option value="pro">Master (+R${settings.pintProf})</option>
            </select>
          </div>

          <div className="flex gap-4">
             <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase text-secondary mb-1">Weight (g)</label>
                <input type="number" className="w-full bg-[#f0f0f0] border-2 border-[#ccc] p-2 text-primary font-pixel text-xl focus:border-primary focus:outline-none" value={weight || ''} onChange={e => setWeight(Number(e.target.value))} />
             </div>
             <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase text-secondary mb-1">Time (h)</label>
                <input type="number" className="w-full bg-[#f0f0f0] border-2 border-[#ccc] p-2 text-primary font-pixel text-xl focus:border-primary focus:outline-none" value={hours || ''} onChange={e => setHours(Number(e.target.value))} />
             </div>
          </div>
        </div>
      </div>

      <div className="retro-box p-0 overflow-hidden bg-[#e8e4d3] border-4 border-secondary">
        <div className="bg-secondary p-2 text-center">
            <h3 className="text-bgPaper font-pixel uppercase tracking-widest text-lg">Quest Reward</h3>
        </div>
        
        <div className="p-4 space-y-2 text-sm font-mono text-bgDark">
          <Row label="Material" value={costs.materialTotal} />
          <Row label="Energy" value={costs.energyTotal} />
          <Row label="Machine" value={costs.machineTotal} />
          <Row label="Labor" value={costs.laborTotal} />
          <Row label="Fixed" value={costs.fixedTotal} />
          <Row label="Service" value={costs.servicesTotal} />
          <Row label="Risk" value={costs.riskValue} />
          
          <div className="border-t-2 border-secondary/30 my-2"></div>
          
          <div className="flex justify-between text-base font-bold">
            <span className="font-pixel uppercase">Total Cost</span>
            <span className="font-pixel">R$ {costs.totalCost.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="bg-bgDark p-4 text-center border-t-4 border-secondary">
            <span className="block text-[10px] text-accent uppercase tracking-widest font-bold mb-1">Sell Price</span>
            <div className="text-4xl font-pixel text-accent mb-2 animate-pulse">
            R$ {costs.finalPrice.toFixed(2)}
            </div>
            <div className="text-bgPaper text-xs font-bold font-pixel uppercase">
            Profit: R$ {costs.profit.toFixed(2)}
            </div>

            <button onClick={handleSave} className="retro-btn mt-4 w-full bg-primary text-white font-pixel uppercase py-3 border-2 border-[#004d24] shadow-[2px_2px_0_#000] hover:bg-[#00b352]">
            Complete Quest (Sell)
            </button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string, value: number }) => (
  <div className="flex justify-between items-center border-b border-secondary/10 pb-1 last:border-0">
    <span className="uppercase text-xs">{label}</span>
    <span>R$ {value.toFixed(2)}</span>
  </div>
);
