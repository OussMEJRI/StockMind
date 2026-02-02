export enum UserRole {
  ADMIN = 'admin',
  GESTIONNAIRE = 'gestionnaire',
  COLLABORATEUR = 'collaborateur'
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Employee {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
}

export interface Location {
  id?: number;
  site: string;
  floor: string;
  room: string;
  exact_position?: string;
}

export interface ChatbotQuery {
  question: string;
  context?: any;
}

export interface ChatbotResponse {
  answer: string;
  data?: any;
  confidence?: number;
}
