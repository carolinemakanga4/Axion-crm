export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  org_id: string;
  created_at: string;
  updated_at: string;
}

export interface Org {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  org_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled';

export interface Project {
  id: string;
  org_id: string;
  client_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  created_at: string;
  updated_at: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  org_id: string;
  client_id: string;
  project_id: string | null;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceWithItems extends Invoice {
  line_items: InvoiceLineItem[];
}

export interface Note {
  id: string;
  org_id: string;
  client_id: string | null;
  project_id: string | null;
  invoice_id: string | null;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalClients: number;
  totalProjects: number;
  activeProjects: number;
  totalInvoices: number;
  paidInvoices: number;
  totalRevenue: number;
  pendingRevenue: number;
}
