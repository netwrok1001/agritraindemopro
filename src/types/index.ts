export type UserRole = 'trainer' | 'manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export type TrainingCategory = 'on-campus' | 'off-campus';

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

export interface TrainingEvent {
  id: string;
  trainerId: string;
  trainerName: string;
  title: string;
  description: string;
  category: TrainingCategory;
  totalFarmersMale: number;
  totalFarmersFemale: number;
  demographics: FarmerDemographics;
  coordinates: GPSCoordinates;
  media: MediaFile[];
  createdAt: string;
  updatedAt: string;
}

export interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
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
