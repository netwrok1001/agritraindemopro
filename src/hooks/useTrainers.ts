import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trainer } from '@/types';
import { toast } from 'sonner';

export const useTrainers = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrainers = async () => {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrainers(data || []);
    } catch (error: any) {
      console.error('Error fetching trainers:', error);
      toast.error('Failed to fetch trainers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const addTrainer = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user' };
      }

      // Create the trainer record
      const { error: trainerError } = await supabase
        .from('trainers')
        .insert({
          user_id: authData.user.id,
          email,
          name
        });

      if (trainerError) {
        return { success: false, error: trainerError.message };
      }

      // Add trainer role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'trainer'
        });

      if (roleError) {
        console.error('Error adding role:', roleError);
      }

      await fetchTrainers();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const deleteTrainer = async (trainerId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('trainers')
        .delete()
        .eq('id', trainerId);

      if (error) {
        return { success: false, error: error.message };
      }

      await fetchTrainers();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    trainers,
    isLoading,
    addTrainer,
    deleteTrainer,
    refetch: fetchTrainers
  };
};
