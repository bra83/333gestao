
import React, { useState } from 'react';
import { Settings } from '../types';

interface SettingsViewProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
  apiUrl: string;
  onUrlChange: (url: string) => void;
  onRetry?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave, apiUrl, onUrlChange, onRetry }) => {
  const [formData, setFormData] = useState<Settings>(settings);

  const handleChange = (key: keyof Settings, value: string) => {
    setFormData(prev => ({ ...prev, [key]: Number(value) }));
  };

  return (
    <div className="space-y-8">
      <div className="jewelry-card p-6">
        <h3 className="text-vault-amber font-black text-lg uppercase mb-6 glow-text flex items-center gap-3">
          LINK COM O MAINFRAME
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-vault-amber opacity-60 text-[10px] font-black uppercase mb-2 block">Google Apps Script URL</label>
            <input 
              value={apiUrl} 
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://script.google.com/..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <button onClick={onRetry} className="bg-vault-amber text-black font-black text-xs uppercase py-4 active:scale-95">Sincronizar</button>
              <button onClick={() => window.open('https://sheets.new', '_blank')} className="border-2 border-vault-amber text-vault-amber font-black text-xs uppercase py-4">Planilha</button>
          </div>
        </div>
      </div>

      <div className="jewelry-card p-6">
        <h3 className="font-black text-xl uppercase mb-8 border-b border-vault-amber/30 pb-4 glow-text text-center">PROTOCOLOS DO VAULT</h3>
        
        <div className="space-y-10">
          <Section title="SISTEMAS E ENERGIA">
             <div className="grid grid-cols-2 gap-4">
               <Input label="PreĆ§o MĆ�quina" val={formData.precoMaq} onChange={v => handleChange('precoMaq', v)} />
               <Input label="Vida Ćtil (H)" val={formData.vidaUtilHoras || 8000} onChange={v => handleChange('vidaUtilHoras', v)} />
               <Input label="Manut. Mensal" val={formData.manutencaoMensal || 20} onChange={v => handleChange('manutencaoMensal', v)} />
               <Input label="PotĆŖncia (W)" val={formData.potencia} onChange={v => handleChange('potencia', v)} />
               <Input label="PreĆ§o kWh" val={formData.kwh} step={0.01} onChange={v => handleChange('kwh', v)} />
               <Input label="Markup (x)" val={formData.markup} step={0.1} onChange={v => handleChange('markup', v)} />
             </div>
          </Section>

          <Section title="CUSTOS OPERACIONAIS">
             <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2">
                  <Input label="Horas de Trabalho Mensais" val={formData.horasTrab} onChange={v => handleChange('horasTrab', v)} />
               </div>
               <Input label="MEI / Taxas" val={formData.mei} onChange={v => handleChange('mei', v)} />
               <Input label="Software / Assin." val={formData.softwares} onChange={v => handleChange('softwares', v)} />
             </div>
          </Section>

          <Section title="MĆO DE OBRA E RISCO">
             <div className="grid grid-cols-2 gap-4">
               <Input label="Valor/Hora PrĆ³pria" val={formData.valorHoraTrabalho || 25} onChange={v => handleChange('valorHoraTrabalho', v)} />
               <Input label="Taxa de Falha (%)" val={formData.risco || 10} onChange={v => handleChange('risco', v)} />
             </div>
          </Section>

          <button onClick={() => onSave(formData)} className="w-full bg-vault-amber text-black font-black uppercase py-6 text-sm tracking-[.3em] active:scale-95 mt-6">
            ATUALIZAR PROTOCOLOS
          </button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="space-y-4">
    <h4 className="text-vault-amber/40 text-[10px] font-black uppercase tracking-widest">{title}</h4>
    {children}
  </div>
);

const Input = ({ label, val, onChange, step }: { label: string, val: number, onChange: (v: string) => void, step?: number }) => (
  <div className="bg-black/20 p-3 border border-vault-amber/20">
    <label className="text-vault-amber opacity-50 text-[9px] font-black block mb-2 uppercase">{label}</label>
    <input 
      type="number" step={step}
      className="!p-0 !bg-transparent !border-none text-vault-amber text-lg font-black focus:ring-0" 
      value={val} onChange={e => onChange(e.target.value)} 
    />
  </div>
);
