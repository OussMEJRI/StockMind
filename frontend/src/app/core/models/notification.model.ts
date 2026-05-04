export interface AppNotification {
  id: number;
  recipient_user_id: number;
  sender_user_id?: number | null;

  equipment_id?: number | null;
  equipment_serial?: string | null;
  equipment_model?: string | null;

  type: 'delete_request' | 'delete_response' | 'info';
  status: 'pending' | 'approved' | 'rejected' | 'info';

  title: string;
  message: string;
  is_read: boolean;

  created_at: string;
  processed_at?: string | null;
  processed_by_user_id?: number | null;
}