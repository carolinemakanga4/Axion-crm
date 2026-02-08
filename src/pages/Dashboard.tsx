import { useDashboardStats, useRecentInvoices, useRevenueByMonth } from '../hooks/useDashboard';
import { LoadingSpinner } from '../components/Loading';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { DollarSign, Users, FolderKanban, FileText, TrendingUp, Clock } from 'lucide-react';

export const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentInvoices, isLoading: invoicesLoading } = useRecentInvoices();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueByMonth();

  if (statsLoading || invoicesLoading || revenueLoading) {
    return <LoadingSpinner />;
  }

  const statCards = [
    {
      name: 'Total Clients',
      value: stats?.totalClients || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Projects',
      value: stats?.activeProjects || 0,
      icon: FolderKanban,
      color: 'bg-green-500',
    },
    {
      name: 'Total Invoices',
      value: stats?.totalInvoices || 0,
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Revenue',
      value: `$${stats?.totalRevenue.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
    {
      name: 'Pending Revenue',
      value: `$${stats?.pendingRevenue.toLocaleString() || '0'}`,
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      name: 'Paid Invoices',
      value: stats?.paidInvoices || 0,
      icon: TrendingUp,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Month</h3>
          {revenueData && revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="revenue" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No revenue data available
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Invoices</h3>
          {recentInvoices && recentInvoices.length > 0 ? (
            <div className="space-y-4">
              {recentInvoices.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{invoice.invoice_number}</p>
                    <p className="text-xs text-gray-500">
                      {invoice.clients?.name} • {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">${invoice.total.toLocaleString()}</p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'sent'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No recent invoices
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
