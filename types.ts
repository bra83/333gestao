export interface Settings {
  // --- Basic / Legacy ---
  markup: number;
  kwh: number; // Preço kWh
  potencia: number; // Watts
  embalagem: number;
  pintSimples: number;
  pintMedia: number;
  pintProf: number;
  aluguel: number;
  softwares: number;
  ecommerce: number;
  mei: number;
  publicidade: number;
  condominio: number;
  precoMaq: number;
  vidaUtil: number; // Months
  horasTrab: number; // Monthly work hours
  FatPrevisto: number;

  // --- Advanced Layer Variables ---
  // Layer 1: Material
  perdaMaterial: number; // % (e.g., 5 for 5%)
  
  // Layer 2: Energy
  eficienciaFonte: number; // 0.85 to 1.0
  
  // Layer 3: Machine
  manutencaoMensal: number;
  vidaUtilHoras: number; // Real lifespan in hours (e.g. 8000)
  
  // Layer 4: Labor
  valorHoraTrabalho: number;
  tempoPreparacao: number; // Minutes
  tempoPosProcessamento: number; // Minutes
  tempoAtendimento: number; // Minutes
  
  // Layer 7: Risk
  risco: number; // %
  imposto: number; // %
  
  [key: string]: number; // Allow dynamic access
}

export interface StockItem {
  id?: string; // Optional for backward compatibility, useful for keying
  nome: string;
  marca?: string; // Brand
  peso: number; // Grams remaining
  preco: number; // Price per 1kg roll
  cor?: string; // Hex Code (e.g., #ff0000)
  tipo?: string; // Material Type (PLA, PETG, ABS)
}

export interface Sale {
  id: string; // Unique ID for editing/deleting
  data: string;
  item: string;
  material: string; // New field
  peso: number;     // New field
  venda: number;
  lucro: number;
}

export interface Expense {
  id: string;
  descricao: string;
  valor: number;
  data: string;
}

export interface AppData {
  estoque: StockItem[];
  vendas: Sale[];
  gastos: Expense[];
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CALCULATOR = 'CALCULATOR',
  INVENTORY = 'INVENTORY',
  SETTINGS = 'SETTINGS',
  TRANSACTIONS = 'TRANSACTIONS'
}