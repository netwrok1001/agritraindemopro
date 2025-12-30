import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TrainingEvent, DashboardStats, FarmerDemographics, ExpenseCategory } from '@/types';
import { toast } from 'sonner';

export const useTrainings = (trainerId?: string) => {
  const [trainings, setTrainings] = useState<TrainingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);

  const fetchTrainings = async () => {
    try {
      let query = supabase
        .from('trainings')
        .select(`
          *,
          trainer:trainers(*),
          media:training_media(*),
          expenses:training_expenses(*, category:expense_categories(*))
        `)
        .order('created_at', { ascending: false });

      if (trainerId) {
        query = query.eq('trainer_id', trainerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTrainings(data || []);
    } catch (error: any) {
      console.error('Error fetching trainings:', error);
      toast.error('Failed to fetch trainings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExpenseCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setExpenseCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching expense categories:', error);
    }
  };

  useEffect(() => {
    fetchTrainings();
    fetchExpenseCategories();
  }, [trainerId]);

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
      stats.maleFarmers += t.total_farmers_male;
      stats.femaleFarmers += t.total_farmers_female;
      stats.totalFarmers += t.total_farmers_male + t.total_farmers_female;
      if (t.training_mode === 'on_campus') stats.onCampusTrainings++;
      else stats.offCampusTrainings++;
      stats.demographicsBreakdown.sc += t.demographics_sc;
      stats.demographicsBreakdown.st += t.demographics_st;
      stats.demographicsBreakdown.gen += t.demographics_gen;
      stats.demographicsBreakdown.obc += t.demographics_obc;
    });

    return stats;
  };

  const getStats = (): DashboardStats => {
    return calculateStats(trainings);
  };

  return {
    trainings,
    isLoading,
    expenseCategories,
    getStats,
    refetch: fetchTrainings
  };
};

export const useAllTrainings = () => {
  const [trainings, setTrainings] = useState<TrainingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllTrainings = async () => {
    try {
      const { data, error } = await supabase
        .from('trainings')
        .select(`
          *,
          trainer:trainers(*),
          media:training_media(*),
          expenses:training_expenses(*, category:expense_categories(*))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrainings(data || []);
    } catch (error: any) {
      console.error('Error fetching all trainings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTrainings();
  }, []);

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
      stats.maleFarmers += t.total_farmers_male;
      stats.femaleFarmers += t.total_farmers_female;
      stats.totalFarmers += t.total_farmers_male + t.total_farmers_female;
      if (t.training_mode === 'on_campus') stats.onCampusTrainings++;
      else stats.offCampusTrainings++;
      stats.demographicsBreakdown.sc += t.demographics_sc;
      stats.demographicsBreakdown.st += t.demographics_st;
      stats.demographicsBreakdown.gen += t.demographics_gen;
      stats.demographicsBreakdown.obc += t.demographics_obc;
    });

    return stats;
  };

  const getTrainerTrainings = (trainerId: string) => {
    return trainings.filter(t => t.trainer_id === trainerId);
  };

  const getTrainerStats = (trainerId: string) => {
    return calculateStats(getTrainerTrainings(trainerId));
  };

  const getAllStats = () => {
    return calculateStats(trainings);
  };

  return {
    trainings,
    isLoading,
    getTrainerTrainings,
    getTrainerStats,
    getAllStats,
    refetch: fetchAllTrainings
  };
};
