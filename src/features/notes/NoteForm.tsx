import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Note } from '../../types';
import { useClients } from '../../hooks/useClients';
import { useProjects } from '../../hooks/useProjects';
import { useInvoices } from '../../hooks/useInvoices';
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

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  client_id: z.string().optional(),
  project_id: z.string().optional(),
  invoice_id: z.string().optional(),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface NoteFormProps {
  note?: Note;
  onSubmit: (data: Omit<Note, 'id' | 'org_id' | 'created_by' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const NoteForm = ({ note, onSubmit, onCancel, isLoading }: NoteFormProps) => {
  const { data: clients } = useClients();
  const { data: projects } = useProjects();
  const { data: invoices } = useInvoices();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: note
      ? {
          title: note.title,
          content: note.content,
          client_id: note.client_id || '',
          project_id: note.project_id || '',
          invoice_id: note.invoice_id || '',
        }
      : undefined,
  });

  const handleFormSubmit = (data: NoteFormData) => {
    onSubmit({
      title: data.title,
      content: data.content,
      client_id: data.client_id || null,
      project_id: data.project_id || null,
      invoice_id: data.invoice_id || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <FormSection title="Note Content" description="Capture the main note details.">
        <div className="space-y-4">
          <FormField id="title" label="Title" required error={errors.title?.message}>
            <FormInput id="title" type="text" invalid={Boolean(errors.title)} {...register('title')} />
          </FormField>
          <FormField id="content" label="Content" required error={errors.content?.message}>
            <FormTextarea id="content" rows={6} invalid={Boolean(errors.content)} {...register('content')} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Related Records" description="Optionally link this note to CRM entities.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField id="client_id" label="Client">
            <FormSelect id="client_id" {...register('client_id')}>
              <option value="">No client</option>
              {clients?.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField id="project_id" label="Project">
            <FormSelect id="project_id" {...register('project_id')}>
              <option value="">No project</option>
              {projects?.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField id="invoice_id" label="Invoice">
            <FormSelect id="invoice_id" {...register('invoice_id')}>
              <option value="">No invoice</option>
              {invoices?.map((invoice: any) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number}
                </option>
              ))}
            </FormSelect>
          </FormField>
        </div>
      </FormSection>

      <FormActions>
        <FormCancelButton onClick={onCancel}>Cancel</FormCancelButton>
        <FormSubmitButton disabled={isLoading}>
          {isLoading ? 'Saving...' : note ? 'Update' : 'Create'}
        </FormSubmitButton>
      </FormActions>
    </form>
  );
};
