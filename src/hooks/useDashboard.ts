import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { DashboardStats } from '../types';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Get total clients
      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // Get total projects
      const { count: totalProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      // Get active projects
      const { count: activeProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get total invoices
      const { count: totalInvoices } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true });

      // Get paid invoices
      const { count: paidInvoices } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'paid');

      // Get revenue stats
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('total, status');

      const totalRevenue =
        invoiceData?.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;

      const pendingRevenue =
        invoiceData
          ?.filter((inv) => inv.status === 'sent' || inv.status === 'draft')
          .reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;

      return {
        totalClients: totalClients || 0,
        totalProjects: totalProjects || 0,
        activeProjects: activeProjects || 0,
        totalInvoices: totalInvoices || 0,
        paidInvoices: paidInvoices || 0,
        totalRevenue,
        pendingRevenue,
      };
    },
  });
};

export const useRecentInvoices = () => {
  return useQuery({
    queryKey: ['recent-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, clients(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });
};

export const useRevenueByMonth = () => {
  return useQuery({
    queryKey: ['revenue-by-month'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('total, issue_date, status')
        .eq('status', 'paid')
        .order('issue_date', { ascending: true });

      if (error) throw error;

      // Group by month
      const monthlyData: Record<string, number> = {};
      data?.forEach((invoice) => {
        if (invoice.issue_date) {
          const month = invoice.issue_date.substring(0, 7); // YYYY-MM
          monthlyData[month] = (monthlyData[month] || 0) + (invoice.total || 0);
        }
      });

      return Object.entries(monthlyData)
        .map(([month, revenue]) => ({ month, revenue }))
        .slice(-12); // Last 12 months
    },
  });
};
