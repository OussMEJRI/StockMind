export enum ContractType {
  CDI = 'CDI',
  CDD = 'CDD',
  STAGIAIRE = 'STAGIAIRE',
  EXTERNE = 'EXTERNE'
}

export enum Department {
  BLI = 'BLI',
  CCI = 'CCI',
  DTSI = 'DTSI',
  OBDS = 'OBDS',
  OBS = 'OBS',
  OIT = 'OIT',
  OW = 'OW',
  SAH = 'SAH',
  SN3 = 'SN3',
  SUPPORT = 'SUPPORT'
}

export interface Employee {
  id?: number;
  name: string;
  email: string;
  cuid?: string;
  contract_type?: ContractType | string;
  department?: Department | string;
}

// ✅ Nouveau modèle historique
export interface EquipmentHistory {
  id: number;
  employee_id: number;
  equipment_id: number;
  assigned_at: string;
  returned_at: string | null;
  notes: string | null;
  created_at: string;
  equipment_serial: string | null;
  equipment_model: string | null;
  equipment_type: string | null;
}

export const DepartmentLabels: Record<Department, string> = {
  [Department.BLI]: 'BLI',
  [Department.CCI]: 'CCI',
  [Department.DTSI]: 'DTSI',
  [Department.OBDS]: 'OBDS',
  [Department.OBS]: 'OBS',
  [Department.OIT]: 'OIT',
  [Department.OW]: 'OW',
  [Department.SAH]: 'SAH',
  [Department.SN3]: 'SN3',
  [Department.SUPPORT]: 'Support'
};

export const ContractTypeLabels: Record<ContractType, string> = {
  [ContractType.CDI]: 'CDI',
  [ContractType.CDD]: 'CDD',
  [ContractType.STAGIAIRE]: 'Stagiaire',
  [ContractType.EXTERNE]: 'Externe'
};
