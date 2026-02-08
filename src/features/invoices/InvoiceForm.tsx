import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Invoice, InvoiceStatus } from '../../types';
import { useClients } from '../../hooks/useClients';
import { useProjects } from '../../hooks/useProjects';

const invoiceSchema = z.object({
  invoice_number: z.string().min(1, 'Invoice number is required'),
  client_id: z.string().min(1, 'Client is required'),
  project_id: z.string().optional(),
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  tax_rate: z.string().optional(),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  invoice?: Invoice;
  onSubmit: (data: Omit<Invoice, 'id' | 'org_id' | 'created_at' | 'updated_at' | 'subtotal' | 'tax_amount' | 'total'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const InvoiceForm = ({ invoice, onSubmit, onCancel, isLoading }: InvoiceFormProps) => {
  const { data: clients } = useClients();
  const { data: projects } = useProjects();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: invoice
      ? {
          invoice_number: invoice.invoice_number,
          client_id: invoice.client_id,
          project_id: invoice.project_id || '',
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          status: invoice.status,
          tax_rate: invoice.tax_rate?.toString() || '0',
          notes: invoice.notes || '',
        }
      : undefined,
  });

  const selectedClientId = watch('client_id');
  const clientProjects = projects?.filter((p: any) => p.client_id === selectedClientId) || [];

  const handleFormSubmit = (data: InvoiceFormData) => {
    onSubmit({
      invoice_number: data.invoice_number,
      client_id: data.client_id,
      project_id: data.project_id || null,
      issue_date: data.issue_date,
      due_date: data.due_date,
      status: data.status as InvoiceStatus,
      tax_rate: data.tax_rate ? parseFloat(data.tax_rate) : 0,
      notes: data.notes || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700">
          Invoice Number <span className="text-red-500">*</span>
        </label>
        <input
          {...register('invoice_number')}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
        {errors.invoice_number && (
          <p className="mt-1 text-sm text-red-600">{errors.invoice_number.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">
          Client <span className="text-red-500">*</span>
        </label>
        <select
          {...register('client_id')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="">Select a client</option>
          {clients?.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id.message}</p>}
      </div>

      <div>
        <label htmlFor="project_id" className="block text-sm font-medium text-gray-700">
          Project (Optional)
        </label>
        <select
          {...register('project_id')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="">No project</option>
          {clientProjects.map((project: any) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700">
            Issue Date <span className="text-red-500">*</span>
          </label>
          <input
            {...register('issue_date')}
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
          {errors.issue_date && (
            <p className="mt-1 text-sm text-red-600">{errors.issue_date.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            {...register('due_date')}
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
          {errors.due_date && <p className="mt-1 text-sm text-red-600">{errors.due_date.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            {...register('status')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
        </div>
        <div>
          <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700">
            Tax Rate (%)
          </label>
          <input
            {...register('tax_rate')}
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : invoice ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};
