import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InvoiceLineItem } from "../../types";

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit_price: z.string().min(1, "Unit price is required"),
});

type LineItemFormData = z.infer<typeof lineItemSchema>;

interface InvoiceLineItemFormProps {
  lineItem?: InvoiceLineItem;
  onSubmit: (
    data: Omit<InvoiceLineItem, "id" | "invoice_id" | "line_total" | "created_at" | "updated_at">,
  ) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const inputBaseClass =
  "h-11 w-full rounded-xl border border-white/15 bg-slate-950/80 px-3.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/30";

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

  const quantity = Number(watch("quantity") || 0);
  const unitPrice = Number(watch("unit_price") || 0);
  const lineTotal = quantity * unitPrice;

  const handleFormSubmit = async (data: LineItemFormData) => {
    await onSubmit({
      description: data.description,
      quantity: parseFloat(data.quantity),
      unit_price: parseFloat(data.unit_price),
    });
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit(handleFormSubmit)(event);
      }}
      className="space-y-5"
    >
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-200">
          Description
        </label>
        <input
          id="description"
          type="text"
          className={inputBaseClass}
          placeholder="e.g. CRM implementation support"
          {...register("description")}
        />
        {errors.description?.message ? (
          <p className="mt-1.5 text-sm text-red-300">{errors.description.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:grid-cols-2">
        <div>
          <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium text-slate-200">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            step="0.01"
            className={inputBaseClass}
            {...register("quantity")}
          />
          {errors.quantity?.message ? (
            <p className="mt-1.5 text-sm text-red-300">{errors.quantity.message}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="unit_price" className="mb-1.5 block text-sm font-medium text-slate-200">
            Unit Price
          </label>
          <input
            id="unit_price"
            type="number"
            step="0.01"
            className={inputBaseClass}
            {...register("unit_price")}
          />
          {errors.unit_price?.message ? (
            <p className="mt-1.5 text-sm text-red-300">{errors.unit_price.message}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.14em] text-cyan-200">Line total</p>
        <p className="mt-1 text-xl font-semibold text-cyan-100">
          ${lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-300 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Saving..." : lineItem ? "Update line item" : "Add line item"}
        </button>
      </div>
    </form>
  );
};
