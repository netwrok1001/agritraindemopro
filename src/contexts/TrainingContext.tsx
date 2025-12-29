import React, { createContext, useContext, useState } from 'react';
import { TrainingEvent, DashboardStats } from '@/types';

interface TrainingContextType {
  trainings: TrainingEvent[];
  addTraining: (training: Omit<TrainingEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTraining: (id: string, training: Partial<TrainingEvent>) => void;
  deleteTraining: (id: string) => void;
  getTrainerStats: (trainerId: string) => DashboardStats;
  getAllStats: () => DashboardStats;
  getTrainerTrainings: (trainerId: string) => TrainingEvent[];
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

// Demo training data
const DEMO_TRAININGS: TrainingEvent[] = [
  {
    id: '1',
    trainerId: '1',
    trainerName: 'Rajesh Kumar',
    title: 'Organic Farming Techniques',
    description: 'Training on modern organic farming methods and sustainable agriculture practices.',
    category: 'on-campus',
    totalFarmersMale: 25,
    totalFarmersFemale: 15,
    demographics: { sc: 10, st: 8, gen: 12, obc: 10 },
    coordinates: { lat: 28.6139, lng: 77.209, address: 'Agricultural University, Delhi' },
    media: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    trainerId: '1',
    trainerName: 'Rajesh Kumar',
    title: 'Water Conservation Methods',
    description: 'Practical training on drip irrigation and water harvesting techniques.',
    category: 'off-campus',
    totalFarmersMale: 30,
    totalFarmersFemale: 20,
    demographics: { sc: 12, st: 10, gen: 15, obc: 13 },
    coordinates: { lat: 28.5355, lng: 77.391, address: 'Village Gram Sabha, Noida' },
    media: [],
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-02-20T09:00:00Z',
  },
  {
    id: '3',
    trainerId: '2',
    trainerName: 'Priya Sharma',
    title: 'Crop Disease Management',
    description: 'Identification and treatment of common crop diseases.',
    category: 'on-campus',
    totalFarmersMale: 18,
    totalFarmersFemale: 22,
    demographics: { sc: 8, st: 6, gen: 14, obc: 12 },
    coordinates: { lat: 28.4595, lng: 77.0266, address: 'Krishi Vigyan Kendra, Gurgaon' },
    media: [],
    createdAt: '2024-03-10T11:00:00Z',
    updatedAt: '2024-03-10T11:00:00Z',
  },
];

export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trainings, setTrainings] = useState<TrainingEvent[]>(DEMO_TRAININGS);

  const addTraining = (training: Omit<TrainingEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTraining: TrainingEvent = {
      ...training,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTrainings(prev => [...prev, newTraining]);
  };

  const updateTraining = (id: string, updates: Partial<TrainingEvent>) => {
    setTrainings(prev =>
      prev.map(t =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      )
    );
  };

  const deleteTraining = (id: string) => {
    setTrainings(prev => prev.filter(t => t.id !== id));
  };

  const calculateStats = (trainingList: TrainingEvent[]): DashboardStats => {
    const stats: DashboardStats = {
      totalTrainings: trainingList.length,
      totalFarmers: 0,
      maleFarmers: 0,
      femaleFarmers: 0,
      onCampusTrainings: 0,
      offCampusTrainings: 0,
      demographicsBreakdown: { sc: 0, st: 0, gen: 0, obc: 0 },
    };

    trainingList.forEach(t => {
      stats.maleFarmers += t.totalFarmersMale;
      stats.femaleFarmers += t.totalFarmersFemale;
      stats.totalFarmers += t.totalFarmersMale + t.totalFarmersFemale;
      if (t.category === 'on-campus') stats.onCampusTrainings++;
      else stats.offCampusTrainings++;
      stats.demographicsBreakdown.sc += t.demographics.sc;
      stats.demographicsBreakdown.st += t.demographics.st;
      stats.demographicsBreakdown.gen += t.demographics.gen;
      stats.demographicsBreakdown.obc += t.demographics.obc;
    });

    return stats;
  };

  const getTrainerStats = (trainerId: string): DashboardStats => {
    return calculateStats(trainings.filter(t => t.trainerId === trainerId));
  };

  const getAllStats = (): DashboardStats => {
    return calculateStats(trainings);
  };

  const getTrainerTrainings = (trainerId: string): TrainingEvent[] => {
    return trainings.filter(t => t.trainerId === trainerId);
  };

  return (
    <TrainingContext.Provider
      value={{
        trainings,
        addTraining,
        updateTraining,
        deleteTraining,
        getTrainerStats,
        getAllStats,
        getTrainerTrainings,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
};

export const useTraining = () => {
  const context = useContext(TrainingContext);
  if (context === undefined) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
};
