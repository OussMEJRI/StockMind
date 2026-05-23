export interface InventoryHistoryItem {
  id: number;

  equipment_id?: number | null;
  equipment_serial?: string | null;
  equipment_model?: string | null;
  equipment_type?: string | null;
  current_status?: string | null;

  action: string;
  from_location?: string | null;
  to_location?: string | null;
  notes?: string | null;
  timestamp: string;

  actor_user_id?: number | null;
  actor_name?: string | null;
  actor_email?: string | null;
}