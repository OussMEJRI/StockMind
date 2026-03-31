export enum UserRole {
  ADMIN = 'admin',
  GESTIONNAIRE = 'gestionnaire',
  COLLABORATEUR = 'collaborateur'
}

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
  name: string;
  email: string;
  cuid?: string;
  contract_type?: ContractType | string;
  department?: Department | string;
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
