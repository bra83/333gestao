
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
    <div className="space-y-6 pb-20">
      
      <div className={`retro-box p-4 bg-white ${lastError ? 'border-heart' : 'border-primary'}`}>
        <div className="flex justify-between items-center mb-2">
          <label className="text-secondary text-xs font-pixel uppercase">
            Server Link (Google Sheet)
          </label>
          <span className={`text-[10px] font-pixel uppercase px-2 py-0.5 border-2 ${lastError ? 'bg-heart text-white border-bgDark' : 'bg-primary text-white border-bgDark'}`}>
            {lastError ? 'Disconnected' : 'Online'}
          </span>
        </div>
        
        <input 
          className="w-full bg-[#f0f0f0] border-2 border-[#ccc] p-2 text-xs mb-3 font-mono focus:border-secondary focus:outline-none" 
          value={apiUrl} 
          onChange={handleUrlChange}
          placeholder="https://..."
        />
        
        <div className="flex gap-2">
            {onRetry && <button onClick={onRetry} className="retro-btn flex-1 bg-secondary text-white text-xs py-2 font-pixel uppercase border border-bgDark">Sync</button>}
            {onMaintenance && <button onClick={onMaintenance} className="retro-btn flex-1 bg-accent text-bgDark text-xs py-2 font-pixel uppercase border border-bgDark">Repair</button>}
        </div>
      </div>

      <div className="retro-box p-5 bg-white">
        <h3 className="text-secondary font-pixel text-xl uppercase mb-6 border-b-4 border-secondary pb-2">Game Options</h3>
        
        <div className="space-y-8">
          <Section title="Machine Stats">
             <div className="grid grid-cols-2 gap-3">
               <Input label="Cost (R$)" val={formData.precoMaq} onChange={v => handleChange('precoMaq', v)} />
               <Input label="HP (Hours)" val={formData.vidaUtilHoras || 8000} onChange={v => handleChange('vidaUtilHoras', v)} />
               <Input label="Repair/Mo" val={formData.manutencaoMensal || 20} onChange={v => handleChange('manutencaoMensal', v)} />
               <Input label="Power (W)" val={formData.potencia} onChange={v => handleChange('potencia', v)} />
               <Input label="Energy (kWh)" val={formData.kwh} step={0.01} onChange={v => handleChange('kwh', v)} />
             </div>
          </Section>

          <Section title="Guild Costs">
             <div className="col-span-2 mb-2">
                <Input label="Work Hours/Mo" val={formData.horasTrab} onChange={v => handleChange('horasTrab', v)} />
             </div>
             <div className="grid grid-cols-3 gap-2">
               <Input label="Tax" val={formData.mei} onChange={v => handleChange('mei', v)} />
               <Input label="Rent" val={formData.aluguel} onChange={v => handleChange('aluguel', v)} />
               <Input label="Tools" val={formData.softwares} onChange={v => handleChange('softwares', v)} />
             </div>
          </Section>

          <Section title="Labor & Skills">
             <div className="grid grid-cols-2 gap-3">
               <Input label="Hourly Rate" val={formData.valorHoraTrabalho || 25} onChange={v => handleChange('valorHoraTrabalho', v)} />
               <Input label="Prep Time" val={formData.tempoPreparacao || 15} onChange={v => handleChange('tempoPreparacao', v)} />
             </div>
          </Section>

          <button onClick={() => onSave(formData)} className="retro-btn w-full bg-primary text-white font-pixel uppercase py-4 border-2 border-bgDark shadow-[4px_4px_0_#000] text-lg hover:bg-[#00b352]">
            Save Game
          </button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="border-b-2 border-secondary/20 pb-6 last:border-0 last:pb-0">
    <h4 className="text-secondary text-xs font-pixel uppercase mb-4 bg-[#fcf9ee] inline-block px-2 border border-secondary">{title}</h4>
    {children}
  </div>
);

const Input = ({ label, val, onChange, step }: { label: string, val: number, onChange: (v: string) => void, step?: number }) => (
  <div>
    <label className="text-secondary/70 text-[10px] font-bold block mb-1 uppercase">{label}</label>
    <input 
      type="number" step={step}
      className="w-full bg-[#f9f9f9] border-2 border-secondary/30 p-2 text-bgDark text-sm font-bold focus:border-primary focus:bg-white focus:outline-none" 
      value={val} onChange={e => onChange(e.target.value)} 
    />
  </div>
);
