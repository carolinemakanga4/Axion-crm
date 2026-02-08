import { supabase } from './supabaseClient';
import { Profile } from '../types';
import { toast } from '../utils/toast';

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
}

export const auth = {
  async signUp(email: string, password: string, fullName: string, orgName: string) {
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('orgs')
        .insert({ name: orgName })
        .select()
        .single();

      if (orgError) throw orgError;
      if (!orgData) throw new Error('Failed to create organization');

      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role: 'admin',
        org_id: orgData.id,
      });

      if (profileError) throw profileError;

      toast.success('Account created successfully! Please check your email to verify your account.');
      return { user: authData.user, error: null };
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
      return { user: null, error };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Signed in successfully!');
      return { user: data.user, error: null };
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      return { user: null, error };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
      return { error: null };
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
      return { error };
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email || '',
        profile: profile || null,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
};
