import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TrainerDashboard from './TrainerDashboard';
import ManagerDashboard from './ManagerDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // ProtectedRoute ensures user exists, but for TS safety:
  if (!user) return null;

  return user.role === 'trainer' ? <TrainerDashboard /> : <ManagerDashboard />;
};

export default Dashboard;
