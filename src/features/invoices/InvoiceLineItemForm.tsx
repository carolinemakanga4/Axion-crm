import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InvoiceLineItem } from '../../types';
import { useEffect } from 'react';

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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description <span className="text-red-500">*</span>
        </label>
        <input
          {...register('description')}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            {...register('quantity')}
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
          {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>}
        </div>
        <div>
          <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700">
            Unit Price <span className="text-red-500">*</span>
          </label>
          <input
            {...register('unit_price')}
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
          {errors.unit_price && (
            <p className="mt-1 text-sm text-red-600">{errors.unit_price.message}</p>
          )}
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-md">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">Line Total:</span>
          <span className="font-semibold text-gray-900">${lineTotal.toFixed(2)}</span>
        </div>
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
          {isLoading ? 'Saving...' : lineItem ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  );
};
