
import React, { useState } from 'react';
import { Settings } from '../types';

interface SettingsViewProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
  apiUrl: string;
  onUrlChange: (url: string) => void;
  lastError?: string | null;
  onRetry?: () => void;
  onMaintenance?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave, apiUrl, onUrlChange, lastError, onRetry, onMaintenance }) => {
  const [formData, setFormData] = useState<Settings>(settings);

  const handleChange = (key: keyof Settings, value: string) => {
    setFormData(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUrlChange(e.target.value);
  };

  return (
    <div className="space-y-6">
      
      <div className={`app-card p-5 ${lastError ? 'border-danger/30 bg-red-50/30' : 'border-primary/10'}`}>
        <div className="flex justify-between items-center mb-3">
          <label className="text-primary text-xs font-bold uppercase tracking-wider">
            Conexão Google Sheets
          </label>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${lastError ? 'bg-danger text-white' : 'bg-success text-white'}`}>
            {lastError ? 'Desconectado' : 'Online'}
          </span>
        </div>
        
        <input 
          className="app-input w-full text-xs font-mono mb-4 text-slate-600" 
          value={apiUrl} 
          onChange={handleUrlChange}
          placeholder="Cole a URL do Web App aqui..."
        />
        
        <div className="flex gap-3">
            {onRetry && <button onClick={onRetry} className="app-btn flex-1 bg-white border border-slate-200 text-slate-600 text-xs py-2 shadow-sm">Sincronizar</button>}
            {onMaintenance && <button onClick={onMaintenance} className="app-btn flex-1 bg-slate-100 text-slate-600 text-xs py-2">Recarregar</button>}
        </div>
      </div>

      <div className="app-card p-6">
        <h3 className="text-primary font-bold text-xl mb-6 pb-4 border-b border-slate-100">Parâmetros do Sistema</h3>
        
        <div className="space-y-8">
          <Section title="Custos da Máquina">
             <div className="grid grid-cols-2 gap-4">
               <Input label="Preço Máquina (R$)" val={formData.precoMaq} onChange={v => handleChange('precoMaq', v)} />
               <Input label="Vida Útil (h)" val={formData.vidaUtilHoras || 8000} onChange={v => handleChange('vidaUtilHoras', v)} />
               <Input label="Manutenção/Mês" val={formData.manutencaoMensal || 20} onChange={v => handleChange('manutencaoMensal', v)} />
               <Input label="Potência (W)" val={formData.potencia} onChange={v => handleChange('potencia', v)} />
               <Input label="Energia (kWh)" val={formData.kwh} step={0.01} onChange={v => handleChange('kwh', v)} />
             </div>
          </Section>

          <Section title="Custos Fixos Mensais">
             <div className="col-span-2 mb-3">
                <Input label="Horas Trabalhadas/Mês" val={formData.horasTrab} onChange={v => handleChange('horasTrab', v)} />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <Input label="Aluguel/Espaço" val={formData.aluguel} onChange={v => handleChange('aluguel', v)} />
               <Input label="MEI/Impostos" val={formData.mei} onChange={v => handleChange('mei', v)} />
               <Input label="Internet" val={formData.internet || 0} onChange={v => handleChange('internet', v)} />
               <Input label="Softwares/Assinaturas" val={formData.softwares} onChange={v => handleChange('softwares', v)} />
               <Input label="Vendas Online (Taxas)" val={formData.ecommerce} onChange={v => handleChange('ecommerce', v)} />
               <Input label="Publicidade/Ads" val={formData.publicidade} onChange={v => handleChange('publicidade', v)} />
             </div>
          </Section>

          <Section title="Mão de Obra & Processos">
             <div className="grid grid-cols-2 gap-4">
               <Input label="Valor da Hora (R$)" val={formData.valorHoraTrabalho || 25} onChange={v => handleChange('valorHoraTrabalho', v)} />
               <Input label="Tempo Prep. (min)" val={formData.tempoPreparacao || 15} onChange={v => handleChange('tempoPreparacao', v)} />
             </div>
          </Section>

          <button onClick={() => onSave(formData)} className="app-btn w-full bg-primary text-white py-4 text-lg shadow-xl shadow-primary/30 hover:shadow-primary/50">
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="border-b border-slate-50 pb-6 last:border-0 last:pb-0">
    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">{title}</h4>
    {children}
  </div>
);

const Input = ({ label, val, onChange, step }: { label: string, val: number, onChange: (v: string) => void, step?: number }) => (
  <div>
    <label className="text-slate-500 text-[10px] font-bold block mb-1 uppercase ml-1">{label}</label>
    <input 
      type="number" step={step}
      className="app-input w-full text-sm font-semibold text-slate-700" 
      value={val} onChange={e => onChange(e.target.value)} 
    />
  </div>
);
