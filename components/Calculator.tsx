
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

    const safeKwh = settings.kwh || 0.95;
    const powerKW = (settings.potencia / 1000);
    const energyTotal = (powerKW * hours * safeKwh) / (settings.eficienciaFonte || 0.9);
    const machineTotal = ((settings.precoMaq / (settings.vidaUtilHoras || 8000)) + ((settings.manutencaoMensal || 20) / (settings.horasTrab || 160))) * hours;
    const laborTotal = ((prepTime + postTime + (settings.tempoAtendimento || 10)) / 60) * (settings.valorHoraTrabalho || 20);
    const fixedTotal = (((settings.aluguel || 0) + (settings.mei || 0) + (settings.softwares || 0)) / (settings.horasTrab || 160)) * hours;

    let paintCost = 0;
    if (paintingType === 'simple') paintCost = settings.pintSimples;
    if (paintingType === 'medium') paintCost = settings.pintMedia;
    if (paintingType === 'pro') paintCost = settings.pintProf;
    const servicesTotal = (settings.embalagem || 0) + paintCost;

    const subtotal = totalMaterialCost + energyTotal + machineTotal + laborTotal + fixedTotal + servicesTotal;
    const totalCost = subtotal * (1 + (failRate / 100));
    const finalPrice = totalCost * (settings.markup || 3);
    const profit = finalPrice - totalCost;

    const safeNum = (n: number) => (isFinite(n) && !isNaN(n)) ? n : 0;
    setCosts({
      materialTotal: safeNum(totalMaterialCost), energyTotal: safeNum(energyTotal), machineTotal: safeNum(machineTotal),
      // Fix: Use correct variable name 'fixedTotal' instead of 'fixedNum'
      laborTotal: safeNum(laborTotal), fixedTotal: safeNum(fixedTotal), servicesTotal: safeNum(servicesTotal),
      totalCost: safeNum(totalCost), finalPrice: safeNum(finalPrice), profit: safeNum(profit), totalWeight: safeNum(totalWeight)
    });
  }, [selectedFilaments, hours, paintingType, settings, stock, prepTime, postTime, failRate]);

  const handleSave = () => {
    if (!itemName) return alert('NOME REQUERIDO!');
    const mats = selectedFilaments.filter(f => f.weight > 0).map(f => ({ name: stock[f.stockIdx].nome, weight: f.weight, stockId: stock[f.stockIdx].id! }));
    onSaveSale(itemName, mats, costs.finalPrice, costs.profit);
    setItemName(''); setSelectedFilaments([{ stockIdx: 0, weight: 0 }]); setHours(0);
  };

  if (stock.length === 0) return <div className="jewelry-card p-12 text-center font-black text-vault-amber uppercase bg-black/40 border-dashed">COFRE VAZIO</div>;

  return (
    <div className="space-y-6">
      <div className="jewelry-card p-6">
        <h2 className="text-vault-amber font-black text-lg uppercase mb-6 glow-text flex items-center gap-2 border-b border-vault-amber/30 pb-2">
          MESA DE CRIAÃ‡ÃƒO
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-vault-amber/60 mb-1 block">Nome do Projeto</label>
            <input type="text" className="w-full" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="PROTOCOL_NAME" />
          </div>

          <div className="jewelry-card p-4 bg-black/20">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-black uppercase text-vault-amber/60">Materiais</label>
              <button onClick={() => setSelectedFilaments([...selectedFilaments, { stockIdx: 0, weight: 0 }])} className="text-[10px] border border-vault-amber px-2 py-1 uppercase font-bold active:bg-vault-amber pulse-glow">
                + Adicionar
              </button>
            </div>
            {selectedFilaments.map((sel, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select className="flex-1 text-xs" value={sel.stockIdx} onChange={e => {
                  const newF = [...selectedFilaments];
                  newF[idx].stockIdx = Number(e.target.value);
                  setSelectedFilaments(newF);
                }}>
                  {stock.map((item, sIdx) => (<option key={sIdx} value={sIdx}>{item.nome}</option>))}
                </select>
                <input type="number" className="w-24 text-xs" placeholder="G" value={sel.weight || ''} onChange={e => {
                  const newF = [...selectedFilaments];
                  newF[idx].weight = Number(e.target.value);
                  setSelectedFilaments(newF);
                }} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-vault-amber/60 mb-1 block">Tempo (Horas)</label>
              <input type="number" className="w-full" value={hours || ''} onChange={e => setHours(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-vault-amber/60 mb-1 block">Pintura</label>
              <select className="w-full" value={paintingType} onChange={e => setPaintingType(e.target.value as any)}>
                <option value="none">OFF</option>
                <option value="simple">LEVEL 1</option>
                <option value="medium">LEVEL 2</option>
                <option value="pro">LEVEL 3</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="jewelry-card bg-black shadow-2xl border-4 border-double">
        <div className="p-6 space-y-3">
          <Row label="Holotapes (Material)" value={costs.materialTotal} />
          <Row label="FusÃ£o EnergÃ©tica" value={costs.energyTotal} />
          <Row label="Desgaste Vault" value={costs.machineTotal} />
          <div className="border-t border-vault-amber/30 pt-3">
            <div className="flex justify-between font-black text-xl glow-text">
              <span className="uppercase text-xs self-center">Custo de ProduÃ§Ã£o</span>
              <span>R$ {costs.totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-vault-amber/5 border-t border-vault-amber/30 text-center">
            <span className="text-[10px] opacity-60 font-black uppercase block mb-1">CotaÃ§Ã£o Final</span>
            <div className="text-5xl font-black glow-text mb-4">
              R$ {costs.finalPrice.toFixed(2)}
            </div>
            <button onClick={handleSave} className="w-full bg-vault-amber text-black font-black uppercase py-4 text-sm tracking-widest active:scale-95 transition-all shadow-[0_0_20px_rgba(255,182,66,0.3)]">
              PROCESSAR FABRICAÃ‡ÃƒO
            </button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string, value: number }) => (
  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest border-b border-vault-amber/10 pb-1">
    <span className="opacity-60">{label}</span>
    <span>R$ {value.toFixed(2)}</span>
  </div>
);
