export interface Emplacement {
  id?: number;
  equipment_id: number;
  etage?: string;
  rosace?: number;
  type_emplacement?: string;
  emplacement_exact?: string;
  designation: string;
  created_at?: string;
  updated_at?: string;
  equipment?: any;
}

export interface EmplacementResponse {
  items: Emplacement[];
  total: number;
  skip: number;
  limit: number;
}
