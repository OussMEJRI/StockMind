export enum EquipmentType {
  PC = 'pc',
  LAPTOP = 'laptop',
  MONITOR = 'monitor',
  PHONE = 'phone',
  ACCESSORY = 'accessory'
}

export enum EquipmentCondition {
  NEW = 'new',
  USED = 'used',
  OUT_OF_SERVICE = 'out_of_service'
}

export enum EquipmentStatus {
  IN_STOCK = 'in_stock',
  ASSIGNED = 'assigned'
}

export interface Equipment {
  id?: number;
  serial_number: string;
  model: string;
  equipment_type: EquipmentType;
  condition: EquipmentCondition;
  status: EquipmentStatus;
  location_id?: number;
  employee_id?: number;
  created_at?: string;
  updated_at?: string;
}
