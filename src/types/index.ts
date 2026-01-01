export type UserRole = 'trainer' | 'manager';

export type TrainingType = 'farmer_farmwoman' | 'rural_youth' | 'inservice';

export type TrainingMode = 'on_campus' | 'off_campus';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  trainerId?: string;
}

export interface Trainer {
  id: string;
  user_id: string | null;
  email: string;
  name: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmerDemographics {
  sc: number;
  st: number;
  gen: number;
  obc: number;
}

export interface GPSCoordinates {
  lat: number;
  lng: number;
  address?: string;
}

export interface ExtensionActivityMedia {
  url: string;
  type: 'image' | 'video';
  name?: string;
}

export interface TrainingEvent {
  id: string;
  trainer_id: string;
  trainer?: Trainer;
  title: string;
  description: string | null;
  training_type: TrainingType;
  training_mode: TrainingMode;
  total_farmers_male: number;
  total_farmers_female: number;
  demographics_sc: number;
  demographics_st: number;
  demographics_gen: number;
  demographics_obc: number;
  gps_lat: number | null;
  gps_lng: number | null;
  gps_address: string | null;
  created_at: string;
  updated_at: string;
  media?: TrainingMedia[];
  expenses?: TrainingExpense[];
  extension_activity?: {
    title: string | null;
    description: string | null;
    partner: string | null;
    media?: ExtensionActivityMedia[];
  } | null;
}

export interface TrainingMedia {
  id: string;
  training_id: string;
  file_url: string;
  file_type: string;
  file_name: string;
  created_at: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  created_at: string;
}

export interface TrainingExpense {
  id: string;
  training_id: string;
  category_id: string;
  category?: ExpenseCategory;
  expense_name: string;
  amount: number;
  created_at: string;
}

export interface DashboardStats {
  totalTrainings: number;
  totalFarmers: number;
  maleFarmers: number;
  femaleFarmers: number;
  onCampusTrainings: number;
  offCampusTrainings: number;
  demographicsBreakdown: FarmerDemographics;
}

export const TRAINING_TYPE_LABELS: Record<TrainingType, string> = {
  farmer_farmwoman: 'Farmer & Farm Woman',
  rural_youth: 'Rural Youth',
  inservice: 'Inservice'
};

export const TRAINING_MODE_LABELS: Record<TrainingMode, string> = {
  on_campus: 'On Campus',
  off_campus: 'Off Campus'
};
