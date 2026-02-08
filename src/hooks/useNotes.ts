import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Note } from '../types';
import { toast } from '../utils/toast';

export const useNotes = (clientId?: string, projectId?: string, invoiceId?: string) => {
  return useQuery({
    queryKey: ['notes', clientId, projectId, invoiceId],
    queryFn: async () => {
      let query = supabase.from('notes').select('*, profiles(full_name, email)').order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      if (invoiceId) {
        query = query.eq('invoice_id', invoiceId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (Note & { profiles: { full_name: string | null; email: string } | null })[];
    },
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('notes').insert(note).select().single();

      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create note');
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Note> & { id: string }) => {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update note');
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete note');
    },
  });
};
