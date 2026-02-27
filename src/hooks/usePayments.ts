import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { Payment } from '../types';

export function usePayments(invoiceId?: string) {
  return useQuery({
    queryKey: ['payments', invoiceId],
    enabled: !!invoiceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', invoiceId!)
        .order('paid_at', { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
  });
}

export function useAddPayment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<Payment, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('payments')
        .insert(payload)
        .select('*')
        .single();

      if (error) throw error;
      return data as Payment;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['payments', data.invoice_id] });
      qc.invalidateQueries({ queryKey: ['invoice', data.invoice_id] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}