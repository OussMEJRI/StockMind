export enum Department {
  IT = 'IT',
  HR = 'RH',
  FINANCE = 'Finance',
  MARKETING = 'Marketing',
  COMMERCIAL = 'Commercial',
  DIRECTION = 'Direction',
  OTHER = 'Other'
}

export interface Employee {
  id?: number;
  full_name: string;
  email: string;
  phone?: string;
  department: Department | string;
  position?: string;
  hire_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeResponse {
  items: Employee[];
  total: number;
  skip: number;
  limit: number;
}
