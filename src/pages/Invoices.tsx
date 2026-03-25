import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice } from '../hooks/useInvoices';
import { useAuth } from '../contexts/AuthContext';
import { Invoice, InvoiceUpsert } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/Loading';
import { InvoiceForm } from '../features/invoices/InvoiceForm';
import { Plus, FileText, Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';

export const Invoices = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { data: invoices, isLoading } = useInvoices(undefined, searchQuery);
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();

  const handleCreate = () => {
    setSelectedInvoice(null);
    setIsModalOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDelete = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: InvoiceUpsert) => {
    if (selectedInvoice) {
      await updateInvoice.mutateAsync({ id: selectedInvoice.id, ...data });
    } else {
      await createInvoice.mutateAsync({
        ...data,
        org_id: user?.profile?.org_id || '',
      });
    }
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedInvoice) {
      await deleteInvoice.mutateAsync(selectedInvoice.id);
      setIsDeleteDialogOpen(false);
      setSelectedInvoice(null);
    }
  };

  const isAdmin = user?.profile?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Invoices</h1>
          <p className="mt-1 text-sm text-slate-400">Manage billing, line items, and invoice documents.</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-300 hover:to-blue-400"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </button>
        )}
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <input
          type="text"
          placeholder="Search invoices by number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 w-full rounded-xl border border-white/15 bg-slate-950/80 px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
        />
      </div>

      {/* Invoices List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !invoices || invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices found"
          description={searchQuery ? 'Try adjusting your search query.' : 'Get started by creating your first invoice.'}
          action={isAdmin ? { label: 'Create Invoice', onClick: handleCreate } : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 shadow-lg shadow-slate-950/40">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-slate-950/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-900/40">
              {invoices.map((invoice: any) => (
                <tr key={invoice.id} className="hover:bg-white/5">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-white">
                    {invoice.invoice_number}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                    {invoice.clients?.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                    {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                    {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-cyan-100">
                    ${invoice.total.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                        invoice.status === 'paid'
                          ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200'
                          : invoice.status === 'sent'
                          ? 'border-blue-300/30 bg-blue-400/10 text-blue-200'
                          : invoice.status === 'overdue'
                          ? 'border-red-300/30 bg-red-400/10 text-red-200'
                          : 'border-slate-300/20 bg-slate-400/10 text-slate-200'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/invoices/${invoice.id}`}
                        className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 transition hover:text-cyan-200"
                        aria-label="View invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {isAdmin && (
                        <>
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 transition hover:text-cyan-200"
                          aria-label="Edit invoice"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice)}
                          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 transition hover:text-red-300"
                          aria-label="Delete invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInvoice(null);
        }}
        title={selectedInvoice ? 'Edit Invoice' : 'Create New Invoice'}
        size="xl"
      >
        <InvoiceForm
          invoice={selectedInvoice || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedInvoice(null);
          }}
          isLoading={createInvoice.isPending || updateInvoice.isPending}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedInvoice(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice ${selectedInvoice?.invoice_number}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};
