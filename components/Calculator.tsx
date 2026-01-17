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
  
  const [costs, setCosts] = useState({
    materialTotal: 0, energyTotal: 0, machineTotal: 0, laborTotal: 0, fixedTotal: 0, servicesTotal: 0, totalCost: 0, finalPrice: 0, profit: 0, totalWeight: 0
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

    const energyTotal = ((settings.potencia / 1000) * hours * (settings.kwh || 0.95)) / (settings.eficienciaFonte || 0.9);
    const machineTotal = ((settings.precoMaq / (settings.vidaUtilHoras || 8000)) + ((settings.manutencaoMensal || 20) / (settings.horasTrab || 160))) * hours;
    const laborTotal = (((settings.tempoPreparacao || 15) + (settings.tempoPosProcessamento || 15) + (settings.tempoAtendimento || 10)) / 60) * (settings.valorHoraTrabalho || 20);
    const fixedTotal = (((settings.aluguel || 0) + (settings.mei || 0) + (settings.softwares || 0)) / (settings.horasTrab || 160)) * hours;

    let paintCost = 0;
    if (paintingType === 'simple') paintCost = settings.pintSimples || 0;
    if (paintingType === 'medium') paintCost = settings.pintMedia || 0;
    if (paintingType === 'pro') paintCost = settings.pintProf || 0;
    const servicesTotal = (settings.embalagem || 0) + paintCost;

    const subtotal = totalMaterialCost + energyTotal + machineTotal + laborTotal + fixedTotal + servicesTotal;
    const totalCost = subtotal * (1 + ((settings.risco || 10) / 100));
    const finalPrice = totalCost * (settings.markup || 3);
    const profit = finalPrice - totalCost;

    const safeNum = (n: number) => (isFinite(n) && !isNaN(n)) ? n : 0;
    setCosts({
      materialTotal: safeNum(totalMaterialCost), energyTotal: safeNum(energyTotal), machineTotal: safeNum(machineTotal),
      laborTotal: safeNum(laborTotal), fixedTotal: safeNum(fixedTotal), servicesTotal: safeNum(servicesTotal),
      totalCost: safeNum(totalCost), finalPrice: safeNum(finalPrice), profit: safeNum(profit), totalWeight: safeNum(totalWeight)
    });
  }, [selectedFilaments, hours, paintingType, settings, stock]);

  const handleWhatsApp = () => {
    const text = `*ORÃ‡AMENTO 3D - SAVEPOINT*\n\n` +
                 `*PeÃ§a:* ${itemName || 'Personalizada'}\n` +
                 `*Material:* ${selectedFilaments.map(f => stock[f.stockIdx]?.nome).filter(Boolean).join(', ')}\n` +
                 `*Peso:* ${costs.totalWeight.toFixed(0)}g\n` +
                 `*Valor:* R$ ${costs.finalPrice.toFixed(2)}\n\n` +
                 `_Gerado via Vault OS_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSave = () => {
    if (!itemName) return alert('DIGITE O NOME DA PEÃ‡A');
    const mats = selectedFilaments.filter(f => f.weight > 0).map(f => ({ name: stock[f.stockIdx].nome, weight: f.weight, stockId: stock[f.stockIdx].id! }));
    onSaveSale(itemName, mats, costs.finalPrice, costs.profit);
    setItemName(''); 
    setSelectedFilaments([{ stockIdx: 0, weight: 0 }]); 
    setHours(0);
  };

  return (
    <div className="space-y-4">
      <div className="jewelry-card p-4">
        <h2 className="font-black text-lg uppercase mb-4 glow-text border-b border-vault-amber/20 pb-1">FABRICADOR</h2>
        <div className="space-y-4">
          <input className="w-full text-xs" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="NOME DO PROJETO" />
          <div className="p-3 bg-black/30 border border-vault-amber/10">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[9px] font-black opacity-60">MATERIAIS</label>
              <button onClick={() => setSelectedFilaments([...selectedFilaments, { stockIdx: 0, weight: 0 }])} className="text-[8px] border border-vault-amber px-2 py-0.5 uppercase">+ NOVO</button>
            </div>
            {selectedFilaments.map((sel, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select className="flex-1 text-[10px]" value={sel.stockIdx} onChange={e => {
                  const newF = [...selectedFilaments];
                  newF[idx].stockIdx = Number(e.target.value);
                  setSelectedFilaments(newF);
                }}>
                  {stock.map((item, sIdx) => (<option key={sIdx} value={sIdx}>{item.nome}</option>))}
                </select>
                <input type="number" className="w-16 text-[10px]" placeholder="G" value={sel.weight || ''} onChange={e => {
                  const newF = [...selectedFilaments];
                  newF[idx].weight = Number(e.target.value);
                  setSelectedFilaments(newF);
                }} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" className="text-[10px]" value={hours || ''} onChange={e => setHours(Number(e.target.value))} placeholder="HORAS" />
            <select className="text-[10px]" value={paintingType} onChange={e => setPaintingType(e.target.value as any)}>
              <option value="none">SEM PINTURA</option>
              <option value="simple">SIMPLES</option>
              <option value="medium">MÃ‰DIA</option>
              <option value="pro">PROFISSIONAL</option>
            </select>
          </div>
        </div>
      </div>

      <div className="jewelry-card bg-vault-panel/50">
        <div className="p-4 bg-vault-amber/5 text-center border-b border-vault-amber/10">
            <span className="text-[8px] opacity-60 font-black block">VALOR FINAL</span>
            <div className="text-4xl font-black glow-text"> R$ {costs.finalPrice.toFixed(2)} </div>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">
          <button onClick={handleWhatsApp} className="border border-vault-green text-vault-green font-black uppercase py-3 text-[9px] active:scale-95">WhatsApp</button>
          <button onClick={handleSave} className="bg-vault-amber text-black font-black uppercase py-3 text-[9px] active:scale-95">Salvar</button>
        </div>
      </div>
    </div>
  );
};
