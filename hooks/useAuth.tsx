import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_verified_agent: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      console.error('Error fetching profile:', error || 'No profile found');
      setError(error?.message || 'No profile found');
      return;
    }

    setUser(data);
  };

  // Monitor auth state
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user;
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Initial session check
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    })();

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Login error:', error.message);
      setError(error.message);
      setLoading(false);
      throw error;
    }

    // Get session manually
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchProfile(session.user.id);
    }

    setLoading(false);
  };

  const register = async (email: string, password: string, name: string, role: string) => {
    console.log("Registering:", { email, password, name, role });
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error || !data.user) {
      console.error('Signup error:', error?.message);
      setError(error?.message || 'Signup failed');
      setLoading(false);
      throw error || new Error('Signup failed');
    }

    const { error: profileError } = await supabase.from('profiles').insert([{
      id: data.user.id,
      email,
      full_name: name,
      role,
      is_verified_agent: false
    }]);

    if (profileError) {
      console.error('Profile creation error:', profileError.message);
      setError(profileError.message);
      setLoading(false);
      throw profileError;
    }

    // Manually fetch session and profile
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchProfile(session.user.id);
    }

    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error.message);
      setLoading(false);
      throw error;
    }
    setUser(null);
    setLoading(false);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
