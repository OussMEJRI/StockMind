// ✅ Aligné exactement avec le backend
export enum EquipmentType {
  PC = 'pc',
  LAPTOP = 'laptop',
  MONITOR = 'monitor',
  PRINTER = 'printer',
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
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}

export interface Equipment {
  id?: number;
  serial_number: string;
  model: string;
  equipment_type: EquipmentType | string;
  condition: EquipmentCondition | string;
  status: EquipmentStatus | string;
  emplacement_id?: number;
  emplacement?: any;
  employee_id?: number;
  employee?: any;
  created_at?: string;
  updated_at?: string;
}

// ✅ Labels pour l'affichage
export const EquipmentTypeLabels: Record<EquipmentType, string> = {
  [EquipmentType.PC]: 'PC de bureau',
  [EquipmentType.LAPTOP]: 'Laptop',
  [EquipmentType.MONITOR]: 'Écran',
  [EquipmentType.PRINTER]: 'Imprimante',
  [EquipmentType.OTHER]: 'Autre'
};

export const EquipmentTypeIcons: Record<EquipmentType, string> = {
  [EquipmentType.PC]: '🖥️',
  [EquipmentType.LAPTOP]: '💻',
  [EquipmentType.MONITOR]: '🖵',
  [EquipmentType.PRINTER]: '🖨️',
  [EquipmentType.OTHER]: '📦'
};

export const EquipmentStatusLabels: Record<EquipmentStatus, string> = {
  [EquipmentStatus.IN_STOCK]: 'En stock',
  [EquipmentStatus.ASSIGNED]: 'Assigné',
  [EquipmentStatus.MAINTENANCE]: 'En maintenance',
  [EquipmentStatus.RETIRED]: 'Retiré'
};

export const EquipmentConditionLabels: Record<EquipmentCondition, string> = {
  [EquipmentCondition.NEW]: 'Neuf',
  [EquipmentCondition.GOOD]: 'Bon état',
  [EquipmentCondition.FAIR]: 'État correct',
  [EquipmentCondition.POOR]: 'Mauvais état'
};
