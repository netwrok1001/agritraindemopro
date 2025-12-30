import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserDetails = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      // Check if user is a manager
      const { data: managerData } = await supabase
        .from('managers')
        .select('*')
        .eq('email', supabaseUser.email)
        .maybeSingle();

      if (managerData) {
        // Check user_roles table
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', supabaseUser.id)
          .maybeSingle();

        if (roleData?.role === 'manager') {
          return {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: managerData.name,
            role: 'manager'
          };
        }
      }

      // Check if user is a trainer
      const { data: trainerData } = await supabase
        .from('trainers')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      if (trainerData) {
        return {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: trainerData.name,
          role: 'trainer',
          trainerId: trainerData.id
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout
          setTimeout(async () => {
            const userDetails = await fetchUserDetails(session.user);
            setUser(userDetails);
            setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserDetails(session.user).then(userDetails => {
          setUser(userDetails);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const userDetails = await fetchUserDetails(data.user);
        if (!userDetails) {
          await supabase.auth.signOut();
          return { success: false, error: 'Account not found. Please contact your manager.' };
        }
        setUser(userDetails);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
