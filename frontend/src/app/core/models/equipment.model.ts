export enum EquipmentType {
  LAPTOP = 'laptop',
  PC = 'pc',
  MONITOR = 'monitor',
  KEYBOARD = 'keyboard',
  MOUSE = 'mouse',
  PRINTER = 'printer',
  SERVER = 'server',
  NETWORK = 'network',
  DOCKING_STATION = 'docking_station',
  OTHER = 'other'
}

export enum EquipmentStatus {
  IN_STOCK = 'in_stock',
  ASSIGNED = 'assigned',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired'
}

export enum EquipmentCondition {
  NEW = 'new',
  USED = 'used',
  REFURBISHED = 'refurbished',
  DAMAGED = 'damaged'
}

export interface Equipment {
  id?: number;
  serial_number: string;
  model: string;
  equipment_type: EquipmentType | string;
  condition: EquipmentCondition | string;
  status: EquipmentStatus | string;
  purchase_date?: string;
  warranty_end_date?: string;
  notes?: string;
  employee_id?: number;
  employee?: any;
  location_id?: number;
  location?: any;
  emplacement_id?: number;
  emplacement?: any;
  created_at?: string;
  updated_at?: string;
}

export interface EquipmentResponse {
  items: Equipment[];
  total: number;
  skip: number;
  limit: number;
}

// Labels pour l'affichage
export const EquipmentTypeLabels: { [key in EquipmentType]: string } = {
  [EquipmentType.LAPTOP]: 'Laptop',
  [EquipmentType.PC]: 'PC de bureau',
  [EquipmentType.MONITOR]: 'Écran',
  [EquipmentType.KEYBOARD]: 'Clavier',
  [EquipmentType.MOUSE]: 'Souris',
  [EquipmentType.PRINTER]: 'Imprimante',
  [EquipmentType.SERVER]: 'Serveur',
  [EquipmentType.NETWORK]: 'Équipement réseau',
  [EquipmentType.DOCKING_STATION]: 'Docking Station',
  [EquipmentType.OTHER]: 'Autre'
};

export const EquipmentStatusLabels: { [key in EquipmentStatus]: string } = {
  [EquipmentStatus.IN_STOCK]: 'En stock',
  [EquipmentStatus.ASSIGNED]: 'Assigné',
  [EquipmentStatus.MAINTENANCE]: 'En maintenance',
  [EquipmentStatus.RETIRED]: 'Retiré'
};

export const EquipmentConditionLabels: { [key in EquipmentCondition]: string } = {
  [EquipmentCondition.NEW]: 'Neuf',
  [EquipmentCondition.USED]: 'Utilisé',
  [EquipmentCondition.REFURBISHED]: 'Reconditionné',
  [EquipmentCondition.DAMAGED]: 'Endommagé'
};
