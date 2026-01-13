
import React, { useState, useEffect } from 'react';
import { Settings, StockItem } from '../types';

interface CalculatorProps {
  settings: Settings;
  stock: StockItem[];
  onSaveSale: (item: string, material: string, weight: number, price: number, profit: number, stockId?: string) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ settings, stock, onSaveSale }) => {
  const [selectedFilamentIdx, setSelectedFilamentIdx] = useState<number>(0);
  const [itemName, setItemName] = useState<string>('');
  const [weight, setWeight] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [paintingType, setPaintingType] = useState<'none' | 'simple' | 'medium' | 'pro'>('none');
  const [costs, setCosts] = useState({
    materialTotal: 0, energyTotal: 0, machineTotal: 0, laborTotal: 0, fixedTotal: 0, servicesTotal: 0, subtotal: 0, riskValue: 0, totalCost: 0, finalPrice: 0, profit: 0
  });

  useEffect(() => {
    if (stock.length === 0) return;
    const filament = stock[selectedFilamentIdx] || stock[0];
    if (!filament) return;

    const safeNum = (n: number | undefined, def: number) => (n !== undefined && !isNaN(n)) ? n : def;

    const safeKwh = safeNum(settings.kwh, 0.95);
    const safeVidaUtil = safeNum(settings.vidaUtilHoras, 8000);
    const safeHorasTrab = safeNum(settings.horasTrab, 160);
    const safeEficiencia = safeNum(settings.eficienciaFonte, 0.9);
    const safePrecoMaq = safeNum(settings.precoMaq, 3500);
    const safeValorHora = safeNum(settings.valorHoraTrabalho, 20);
    const prepTime = safeNum(settings.tempoPreparacao, 15);
    const postTime = safeNum(settings.tempoPosProcessamento, 15);
    const serviceTime = safeNum(settings.tempoAtendimento, 10);
    const failRate = safeNum(settings.risco, 10);
    const markup = safeNum(settings.markup, 3);
    const perdaMat = safeNum(settings.perdaMaterial, 5);
    const potencia = safeNum(settings.potencia, 350);

    // 1. Custo Material
    const materialBase = (weight / 1000) * filament.preco;
    const materialLoss = materialBase * (perdaMat / 100);
    const materialTotal = materialBase + materialLoss;

    // 2. Custo Energia
    const powerKW = (potencia / 1000);
    const energyConsumption = (powerKW * hours) / safeEficiencia;
    const energyTotal = energyConsumption * safeKwh;

    // 3. Depreciação e Manutenção Máquina
    const depreciationPerHour = safePrecoMaq / safeVidaUtil;
    const maintenancePerHour = safeNum(settings.manutencaoMensal, 20) / safeHorasTrab;
    const machineTotal = (depreciationPerHour + maintenancePerHour) * hours;

    // 4. Mão de Obra (Fixa por peça)
    const totalLaborMinutes = prepTime + postTime + serviceTime;
    const laborTotal = (totalLaborMinutes / 60) * safeValorHora;

    // 5. Custos Fixos (Alocados por hora de impressão)
    const totalMonthlyFixed = settings.aluguel + settings.mei + settings.softwares + settings.ecommerce + settings.publicidade + settings.condominio;
    const fixedCostPerHour = totalMonthlyFixed / safeHorasTrab;
    const fixedTotal = fixedCostPerHour * hours;

    // 6. Serviços e Acabamento
    let paintCost = 0;
    if (paintingType === 'simple') paintCost = settings.pintSimples;
    if (paintingType === 'medium') paintCost = settings.pintMedia;
    if (paintingType === 'pro') paintCost = settings.pintProf;
    const servicesTotal = settings.embalagem + paintCost;

    const subtotal = materialTotal + energyTotal + machineTotal + laborTotal + fixedTotal + servicesTotal;
    const riskValue = subtotal * (failRate / 100);
    const totalCost = subtotal + riskValue;
    const finalPrice = totalCost * markup;
    const profit = finalPrice - totalCost;

    setCosts({
      materialTotal, energyTotal, machineTotal, laborTotal, fixedTotal, servicesTotal, subtotal, riskValue, totalCost, finalPrice, profit
    });

  }, [weight, hours, paintingType, selectedFilamentIdx, settings, stock]);

  const handleSave = () => {
    if (!itemName) return alert('Nome da peça obrigatório!');
    const filament = stock[selectedFilamentIdx] || stock[0];
    const materialName = filament.marca ? `${filament.nome} (${filament.marca})` : filament.nome;
    
    if (window.confirm(`Confirmar venda de "${itemName}" por R$ ${costs.finalPrice.toFixed(2)}?`)) {
      onSaveSale(itemName, materialName, weight, costs.finalPrice, costs.profit, filament.id);
      setItemName(''); setWeight(0); setHours(0);
    }
  };

  if (stock.length === 0) return (
    <div className="jewelry-card p-10 text-center">
      <h3 className="text-amethyst-600 font-black uppercase tracking-widest mb-2">Cofre Vazio</h3>
      <p className="text-slate-400 text-xs">Cadastre seus filamentos na aba "Gemas" para começar.</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="jewelry-card p-6 bg-white border-2 border-sapphire-100 shadow-xl">
        <h2 className="text-sapphire-600 font-black text-lg uppercase tracking-widest mb-6 border-b border-sapphire-100 pb-2">Calculadora de Custos</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 ml-1">Projeto</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl text-slate-900 font-bold outline-none focus:border-sapphire-500 transition-colors"
              placeholder="Ex: Vaso Geométrico"
              value={itemName} 
              onChange={e => setItemName(e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 ml-1">Filamento</label>
              <select 
                className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl text-slate-900 font-bold outline-none focus:border-sapphire-500 transition-colors appearance-none"
                value={selectedFilamentIdx} 
                onChange={e => setSelectedFilamentIdx(Number(e.target.value))}
              >
                {stock.map((item, idx) => (<option key={idx} value={idx}>{item.nome} ({item.marca})</option>))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 ml-1">Acabamento</label>
              <select 
                className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl text-slate-900 font-bold outline-none focus:border-sapphire-500 transition-colors"
                value={paintingType} 
                onChange={e => setPaintingType(e.target.value as any)}
              >
                <option value="none">Nenhum</option>
                <option value="simple">Simples (+R${settings.pintSimples})</option>
                <option value="medium">Médio (+R${settings.pintMedia})</option>
                <option value="pro">Profissional (+R${settings.pintProf})</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 ml-1">Peso (g)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl text-slate-900 font-black text-lg outline-none focus:border-sapphire-500 transition-colors"
                    value={weight || ''} 
                    onChange={e => setWeight(Number(e.target.value))} 
                  />
                  <span className="absolute right-3 top-4 text-xs font-bold text-slate-400">g</span>
                </div>
             </div>
             <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 ml-1">Tempo (h)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl text-slate-900 font-black text-lg outline-none focus:border-sapphire-500 transition-colors"
                    value={hours || ''} 
                    onChange={e => setHours(Number(e.target.value))} 
                  />
                  <span className="absolute right-3 top-4 text-xs font-bold text-slate-400">h</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="jewelry-card p-0 overflow-hidden bg-white border-2 border-emerald-100">
        <div className="bg-emerald-50/50 p-4 text-center border-b border-emerald-100">
            <h3 className="text-emerald-700 font-black uppercase tracking-widest text-xs">Detalhamento de Custos</h3>
        </div>
        
        <div className="p-6 space-y-3">
          <Row label="Material" value={costs.materialTotal} color="text-slate-600" />
          <Row label="Energia" value={costs.energyTotal} color="text-slate-600" />
          <Row label="Máquina" value={costs.machineTotal} color="text-slate-600" />
          <Row label="Mão de Obra" value={costs.laborTotal} color="text-slate-600" />
          <Row label="Custos Fixos" value={costs.fixedTotal} color="text-slate-600" />
          <Row label="Serviços" value={costs.servicesTotal} color="text-slate-600" />
          <Row label="Risco / Falha" value={costs.riskValue} color="text-rose-500" />
          
          <div className="border-t-2 border-slate-100 my-3 pt-3"></div>
          
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-500 uppercase text-xs">Custo Total</span>
            <span className="font-black text-slate-800 text-lg">R$ {costs.totalCost.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="bg-slate-900 p-6 text-center">
            <span className="block text-[10px] text-emerald-400 uppercase tracking-[0.2em] font-bold mb-2">Preço Sugerido</span>
            <div className="text-5xl font-black text-white mb-2 tracking-tighter">
            R$ {costs.finalPrice.toFixed(2)}
            </div>
            <div className="text-emerald-400/80 text-xs font-bold uppercase tracking-widest mb-6">
            Lucro Estimado: R$ {costs.profit.toFixed(2)}
            </div>

            <button 
              onClick={handleSave} 
              className="w-full jewel-gradient-emerald text-white font-black py-4 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-900/50 active:scale-95 transition-all"
            >
              Registrar Venda
            </button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="flex justify-between items-center">
    <span className="uppercase text-[10px] font-bold text-slate-400 tracking-wider">{label}</span>
    <span className={`font-bold text-sm ${color}`}>R$ {value.toFixed(2)}</span>
  </div>
);
