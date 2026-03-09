import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Client } from '../../types';
import {
  FormActions,
  FormCancelButton,
  FormField,
  FormInput,
  FormSection,
  FormSubmitButton,
  FormTextarea,
} from '../../components/forms';

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: Omit<Client, 'id' | 'org_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ClientForm = ({ client, onSubmit, onCancel, isLoading }: ClientFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client
      ? {
          name: client.name,
          email: client.email || '',
          phone: client.phone || '',
          company: client.company || '',
          address: client.address || '',
          notes: client.notes || '',
        }
      : undefined,
  });

  const handleFormSubmit = (data: ClientFormData) => {
    onSubmit({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      address: data.address || null,
      notes: data.notes || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <FormSection title="Contact Information" description="Primary details for your client record.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField id="name" label="Name" required error={errors.name?.message}>
            <FormInput id="name" type="text" invalid={Boolean(errors.name)} {...register('name')} />
          </FormField>
          <FormField id="email" label="Email" error={errors.email?.message}>
            <FormInput id="email" type="email" invalid={Boolean(errors.email)} {...register('email')} />
          </FormField>
          <FormField id="phone" label="Phone" className="md:col-span-2">
            <FormInput id="phone" type="tel" {...register('phone')} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Company Details">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField id="company" label="Company">
            <FormInput id="company" type="text" {...register('company')} />
          </FormField>
          <FormField id="address" label="Address" className="md:col-span-2">
            <FormTextarea id="address" rows={3} {...register('address')} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Internal Notes">
        <FormField id="notes" label="Notes">
          <FormTextarea id="notes" rows={4} {...register('notes')} />
        </FormField>
      </FormSection>

      <FormActions>
        <FormCancelButton onClick={onCancel}>Cancel</FormCancelButton>
        <FormSubmitButton disabled={isLoading}>
          {isLoading ? 'Saving...' : client ? 'Update' : 'Create'}
        </FormSubmitButton>
      </FormActions>
    </form>
  );
};
