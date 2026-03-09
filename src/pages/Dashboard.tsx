import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import {
  ArrowUpRight,
  CircleDollarSign,
  Clock3,
  FileText,
  FolderKanban,
  TrendingUp,
  Users,
} from "lucide-react";
import { LoadingSpinner } from "../components/Loading";
import { MetricCard } from "../components/dashboard/MetricCard";
import {
  useDashboardStats,
  useRecentInvoices,
  useRevenueByMonth,
} from "../hooks/useDashboard";

type RecentInvoice = {
  id: string;
  invoice_number: string;
  issue_date: string;
  total: number;
  status: string;
  clients?: { name?: string | null } | null;
};

const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

const statusStyles: Record<string, string> = {
  paid: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
  sent: "border-blue-300/30 bg-blue-400/10 text-blue-200",
  overdue: "border-red-300/30 bg-red-400/10 text-red-200",
  draft: "border-slate-300/20 bg-slate-400/10 text-slate-200",
  cancelled: "border-slate-300/20 bg-slate-400/10 text-slate-300",
};

export const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentInvoices, isLoading: invoicesLoading } = useRecentInvoices();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueByMonth();

  if (statsLoading || invoicesLoading || revenueLoading) {
    return <LoadingSpinner />;
  }

  const totalRevenue = stats?.totalRevenue || 0;
  const pendingRevenue = stats?.pendingRevenue || 0;
  const totalInvoices = stats?.totalInvoices || 0;
  const paidInvoices = stats?.paidInvoices || 0;
  const paidRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;
  const pendingShare =
    totalRevenue + pendingRevenue > 0
      ? Math.round((pendingRevenue / (totalRevenue + pendingRevenue)) * 100)
      : 0;

  const statCards = [
    {
      label: "Total Clients",
      value: stats?.totalClients || 0,
      detail: "Accounts actively tracked in your workspace",
      icon: Users,
      accent: "bg-gradient-to-br from-cyan-400/70 to-blue-500/70",
    },
    {
      label: "Active Projects",
      value: stats?.activeProjects || 0,
      detail: `${stats?.totalProjects || 0} projects overall`,
      icon: FolderKanban,
      accent: "bg-gradient-to-br from-emerald-400/70 to-cyan-500/70",
    },
    {
      label: "Total Invoices",
      value: totalInvoices,
      detail: `${paidRate}% paid completion rate`,
      icon: FileText,
      accent: "bg-gradient-to-br from-blue-400/70 to-indigo-500/70",
    },
    {
      label: "Collected Revenue",
      value: formatCurrency(totalRevenue),
      detail: "Successfully paid invoices",
      icon: CircleDollarSign,
      accent: "bg-gradient-to-br from-cyan-400/70 to-sky-500/70",
    },
    {
      label: "Pending Revenue",
      value: formatCurrency(pendingRevenue),
      detail: `${pendingShare}% of total expected revenue`,
      icon: Clock3,
      accent: "bg-gradient-to-br from-amber-300/70 to-orange-500/70",
    },
    {
      label: "Paid Invoices",
      value: paidInvoices,
      detail: "Invoices fully settled",
      icon: TrendingUp,
      accent: "bg-gradient-to-br from-violet-400/70 to-blue-500/70",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-slate-900 p-6 shadow-xl shadow-cyan-950/30 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Revenue Overview
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
              Monitor clients, projects, invoicing, and cash flow from one CRM command center.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Collection rate</p>
            <div className="mt-2 flex items-center gap-2">
              <p className="text-2xl font-semibold text-cyan-100">{paidRate}%</p>
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2 py-0.5 text-xs font-medium text-cyan-200">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Healthy trend
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/40 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Revenue by Month</h2>
              <p className="text-sm text-slate-400">Paid invoice totals across the last 12 months</p>
            </div>
          </div>
          {revenueData && revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(56, 189, 248, 0.08)" }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill="url(#revenueGradient)" />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[290px] items-center justify-center rounded-xl border border-dashed border-white/15 bg-slate-950/60 text-sm text-slate-400">
              No paid revenue data available yet.
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/40 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-white">Recent Invoices</h2>
            <p className="text-sm text-slate-400">Most recent billing activity in your account</p>
          </div>
          {recentInvoices && recentInvoices.length > 0 ? (
            <div className="space-y-3">
              {(recentInvoices as RecentInvoice[]).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-start justify-between rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{invoice.invoice_number}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {invoice.clients?.name || "Unknown Client"} -{" "}
                      {format(new Date(invoice.issue_date), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="ml-3 text-right">
                    <p className="text-sm font-semibold text-cyan-100">
                      {formatCurrency(invoice.total || 0)}
                    </p>
                    <span
                      className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${
                        statusStyles[invoice.status] || statusStyles.draft
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[290px] items-center justify-center rounded-xl border border-dashed border-white/15 bg-slate-950/60 text-sm text-slate-400">
              No recent invoices yet.
            </div>
          )}
        </article>
      </section>
    </div>
  );
};
