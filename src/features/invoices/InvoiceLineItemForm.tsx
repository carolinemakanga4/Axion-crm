import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InvoiceLineItem } from '../../types';
import {
  FormActions,
  FormCancelButton,
  FormField,
  FormInput,
  FormSection,
  FormSubmitButton,
} from '../../components/forms';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  unit_price: z.string().min(1, 'Unit price is required'),
});

type LineItemFormData = z.infer<typeof lineItemSchema>;

interface InvoiceLineItemFormProps {
  lineItem?: InvoiceLineItem;
  onSubmit: (data: Omit<InvoiceLineItem, 'id' | 'invoice_id' | 'line_total' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const InvoiceLineItemForm = ({
  lineItem,
  onSubmit,
  onCancel,
  isLoading,
}: InvoiceLineItemFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LineItemFormData>({
    resolver: zodResolver(lineItemSchema),
    defaultValues: lineItem
      ? {
          description: lineItem.description,
          quantity: lineItem.quantity.toString(),
          unit_price: lineItem.unit_price.toString(),
        }
      : undefined,
  });

  const quantity = watch('quantity');
  const unitPrice = watch('unit_price');
  const lineTotal = quantity && unitPrice ? parseFloat(quantity) * parseFloat(unitPrice) : 0;

  const handleFormSubmit = (data: LineItemFormData) => {
    onSubmit({
      description: data.description,
      quantity: parseFloat(data.quantity),
      unit_price: parseFloat(data.unit_price),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <FormSection title="Line Item Details">
        <div className="space-y-4">
          <FormField id="description" label="Description" required error={errors.description?.message}>
            <FormInput
              id="description"
              type="text"
              invalid={Boolean(errors.description)}
              {...register('description')}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField id="quantity" label="Quantity" required error={errors.quantity?.message}>
              <FormInput
                id="quantity"
                type="number"
                step="0.01"
                invalid={Boolean(errors.quantity)}
                {...register('quantity')}
              />
            </FormField>
            <FormField id="unit_price" label="Unit Price" required error={errors.unit_price?.message}>
              <FormInput
                id="unit_price"
                type="number"
                step="0.01"
                invalid={Boolean(errors.unit_price)}
                {...register('unit_price')}
              />
            </FormField>
          </div>
        </div>
      </FormSection>

      <FormSection title="Summary" className="bg-white">
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Line Total:</span>
            <span className="font-semibold text-gray-900">${lineTotal.toFixed(2)}</span>
          </div>
        </div>
      </FormSection>

      <FormActions>
        <FormCancelButton onClick={onCancel}>Cancel</FormCancelButton>
        <FormSubmitButton disabled={isLoading}>
          {isLoading ? 'Saving...' : lineItem ? 'Update' : 'Add'}
        </FormSubmitButton>
      </FormActions>
    </form>
  );
};
