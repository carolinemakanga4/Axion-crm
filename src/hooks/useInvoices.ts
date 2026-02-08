import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Invoice, InvoiceLineItem, InvoiceWithItems } from '../types';
import { toast } from '../utils/toast';

export const useInvoices = (clientId?: string, searchQuery?: string) => {
  return useQuery({
    queryKey: ['invoices', clientId, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*, clients(name), projects(name)')
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      if (searchQuery) {
        query = query.or(`invoice_number.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (Invoice & { clients: { name: string }; projects: { name: string } | null })[];
    },
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*, clients(*), projects(*)')
        .eq('id', id)
        .single();

      if (invoiceError) throw invoiceError;

      const { data: lineItems, error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', id)
        .order('created_at', { ascending: true });

      if (lineItemsError) throw lineItemsError;

      return {
        ...invoice,
        line_items: lineItems || [],
      } as InvoiceWithItems;
    },
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'subtotal' | 'tax_amount' | 'total'>) => {
      const { data, error } = await supabase.from('invoices').insert(invoice).select().single();

      if (error) throw error;
      return data as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create invoice');
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Invoice> & { id: string }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Invoice;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      toast.success('Invoice updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update invoice');
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete invoice');
    },
  });
};

export const useInvoiceLineItems = (invoiceId: string) => {
  return useQuery({
    queryKey: ['invoice-line-items', invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as InvoiceLineItem[];
    },
    enabled: !!invoiceId,
  });
};

export const useCreateInvoiceLineItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<InvoiceLineItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('invoice_line_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data as InvoiceLineItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoice-line-items', data.invoice_id] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.invoice_id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Line item added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add line item');
    },
  });
};

export const useUpdateInvoiceLineItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InvoiceLineItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('invoice_line_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as InvoiceLineItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoice-line-items', data.invoice_id] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.invoice_id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Line item updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update line item');
    },
  });
};

export const useDeleteInvoiceLineItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get invoice_id before deleting
      const { data: item } = await supabase
        .from('invoice_line_items')
        .select('invoice_id')
        .eq('id', id)
        .single();

      const { error } = await supabase.from('invoice_line_items').delete().eq('id', id);

      if (error) throw error;
      return item?.invoice_id;
    },
    onSuccess: (invoiceId) => {
      if (invoiceId) {
        queryClient.invalidateQueries({ queryKey: ['invoice-line-items', invoiceId] });
        queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
      }
      toast.success('Line item deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete line item');
    },
  });
};
