import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Project, ProjectStatus } from '../../types';
import { useClients } from '../../hooks/useClients';
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

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'on_hold', 'cancelled']),
  client_id: z.string().min(1, 'Client is required'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: Omit<Project, 'id' | 'org_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProjectForm = ({ project, onSubmit, onCancel, isLoading }: ProjectFormProps) => {
  const { data: clients } = useClients();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          name: project.name,
          description: project.description || '',
          status: project.status,
          client_id: project.client_id,
          start_date: project.start_date || '',
          end_date: project.end_date || '',
          budget: project.budget?.toString() || '',
        }
      : undefined,
  });

  const handleFormSubmit = (data: ProjectFormData) => {
    onSubmit({
      name: data.name,
      description: data.description || null,
      status: data.status as ProjectStatus,
      client_id: data.client_id,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      budget: data.budget ? parseFloat(data.budget) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <FormSection title="Project Overview" description="Set the core project metadata.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField id="name" label="Project Name" required error={errors.name?.message}>
            <FormInput id="name" type="text" invalid={Boolean(errors.name)} {...register('name')} />
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
          <FormField id="status" label="Status" required error={errors.status?.message} className="md:col-span-2">
            <FormSelect id="status" invalid={Boolean(errors.status)} {...register('status')}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </FormSelect>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Timeline and Budget">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField id="start_date" label="Start Date">
            <FormInput id="start_date" type="date" {...register('start_date')} />
          </FormField>
          <FormField id="end_date" label="End Date">
            <FormInput id="end_date" type="date" {...register('end_date')} />
          </FormField>
          <FormField id="budget" label="Budget" className="md:col-span-2">
            <FormInput id="budget" type="number" step="0.01" {...register('budget')} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Description">
        <FormField id="description" label="Description">
          <FormTextarea id="description" rows={4} {...register('description')} />
        </FormField>
      </FormSection>

      <FormActions>
        <FormCancelButton onClick={onCancel}>Cancel</FormCancelButton>
        <FormSubmitButton disabled={isLoading}>
          {isLoading ? 'Saving...' : project ? 'Update' : 'Create'}
        </FormSubmitButton>
      </FormActions>
    </form>
  );
};
