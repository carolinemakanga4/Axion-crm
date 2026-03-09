import PaymentsPanel from './PaymentsPanel';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Invoice, InvoiceStatus, InvoiceUpsert } from '../../types';
import { useClients } from '../../hooks/useClients';
import { useProjects } from '../../hooks/useProjects';
import {
  FormActions,
  FormCancelButton,
  FormField,
  FormInput,
  FormSection,
  FormSelect,
  FormSubmitButton,
  FormTextarea,
} from '../../components/forms';

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
  onSubmit: (data: InvoiceUpsert) => void;
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <FormSection title="Invoice Details" description="Core information for this invoice.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            id="invoice_number"
            label="Invoice Number"
            required
            error={errors.invoice_number?.message}
          >
            <FormInput
              id="invoice_number"
              type="text"
              invalid={Boolean(errors.invoice_number)}
              {...register('invoice_number')}
            />
          </FormField>
          <FormField id="client_id" label="Client" required error={errors.client_id?.message}>
            <FormSelect id="client_id" invalid={Boolean(errors.client_id)} {...register('client_id')}>
              <option value="">Select a client</option>
              {clients?.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField
            id="project_id"
            label="Project"
            helperText={
              !selectedClientId ? 'Choose a client first to filter available projects.' : undefined
            }
            className="md:col-span-2"
          >
            <FormSelect id="project_id" disabled={!selectedClientId} {...register('project_id')}>
              <option value="">No project</option>
              {clientProjects.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </FormSelect>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Dates and Status">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField id="issue_date" label="Issue Date" required error={errors.issue_date?.message}>
            <FormInput
              id="issue_date"
              type="date"
              invalid={Boolean(errors.issue_date)}
              {...register('issue_date')}
            />
          </FormField>
          <FormField id="due_date" label="Due Date" required error={errors.due_date?.message}>
            <FormInput
              id="due_date"
              type="date"
              invalid={Boolean(errors.due_date)}
              {...register('due_date')}
            />
          </FormField>
          <FormField id="status" label="Status" required error={errors.status?.message}>
            <FormSelect id="status" invalid={Boolean(errors.status)} {...register('status')}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </FormSelect>
          </FormField>
          <FormField id="tax_rate" label="Tax Rate (%)">
            <FormInput id="tax_rate" type="number" step="0.01" {...register('tax_rate')} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Additional Notes">
        <FormField id="notes" label="Notes">
          <FormTextarea id="notes" rows={3} {...register('notes')} />
        </FormField>
      </FormSection>

      <FormActions>
        <FormCancelButton onClick={onCancel}>Cancel</FormCancelButton>
        <FormSubmitButton disabled={isLoading}>
          {isLoading ? 'Saving...' : invoice ? 'Update' : 'Create'}
        </FormSubmitButton>
      </FormActions>

      {invoice?.id ? <PaymentsPanel invoiceId={invoice.id} /> : null}
    </form>
  );
};
