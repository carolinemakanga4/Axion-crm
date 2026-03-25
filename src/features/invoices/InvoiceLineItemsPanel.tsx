import { useMemo, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { InvoiceLineItem } from "../../types";
import {
  useCreateInvoiceLineItem,
  useDeleteInvoiceLineItem,
  useInvoiceLineItems,
  useUpdateInvoiceLineItem,
} from "../../hooks/useInvoices";
import { Modal } from "../../components/Modal";
import { InvoiceLineItemForm } from "./InvoiceLineItemForm";
import { toast } from "../../utils/toast";

interface InvoiceLineItemsPanelProps {
  invoiceId?: string;
  taxRate?: number; // decimal (0.15 = 15%)
  readOnly?: boolean;
}

const formatCurrency = (value: number) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const InvoiceLineItemsPanel = ({
  invoiceId,
  taxRate = 0,
  readOnly = false,
}: InvoiceLineItemsPanelProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLineItem, setSelectedLineItem] = useState<InvoiceLineItem | null>(null);
  const { data: lineItems = [], isLoading } = useInvoiceLineItems(invoiceId || "");
  const createLineItem = useCreateInvoiceLineItem();
  const updateLineItem = useUpdateInvoiceLineItem();
  const deleteLineItem = useDeleteInvoiceLineItem();

  const totals = useMemo(() => {
    const taxRateDecimal = Number(taxRate || 0) > 1 ? Number(taxRate || 0) / 100 : Number(taxRate || 0);
    const subtotal = lineItems.reduce((sum, item) => sum + Number(item.line_total || 0), 0);
    const taxAmount = subtotal * taxRateDecimal;
    return {
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
      taxRateDecimal,
    };
  }, [lineItems, taxRate]);

  if (!invoiceId) {
    return (
      <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
        <h3 className="text-base font-semibold text-white">Line Items</h3>
        <p className="mt-2 text-sm text-slate-400">
          Save the invoice first, then add line items and generate the final totals.
        </p>
      </section>
    );
  }

  const handleCreate = () => {
    setSelectedLineItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: InvoiceLineItem) => {
    setSelectedLineItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this line item?")) return;
    await deleteLineItem.mutateAsync(id);
  };

  const handleSubmit = async (
    data: Omit<
      InvoiceLineItem,
      "id" | "invoice_id" | "line_total" | "created_at" | "updated_at"
    >,
  ) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...data,
        line_total: Number(data.quantity) * Number(data.unit_price),
      };

      if (!Number.isFinite(payload.quantity) || !Number.isFinite(payload.unit_price)) {
        throw new Error("Quantity and unit price must be valid numbers.");
      }

      const savePromise = selectedLineItem
        ? updateLineItem.mutateAsync({ id: selectedLineItem.id, ...payload })
        : createLineItem.mutateAsync({
            invoice_id: invoiceId,
            ...payload,
          });

      await Promise.race([
        savePromise,
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Line item save timed out. Please try again.")), 15000);
        }),
      ]);

      setIsModalOpen(false);
      setSelectedLineItem(null);
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err?.message || "Failed to save line item.");
      console.error("Line item save error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">Line Items</h3>
          <p className="text-sm text-slate-400">Add billable items and review totals.</p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-300 hover:to-blue-400"
          >
            <Plus className="h-4 w-4" />
            Add line item
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
          Loading line items...
        </div>
      ) : lineItems.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-slate-950/60 p-5 text-sm text-slate-400">
          No line items yet.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-slate-950/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  Qty
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  Total
                </th>
                {!readOnly && (
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-900/40">
              {lineItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-sm text-slate-200">{item.description}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-cyan-100">
                    {formatCurrency(item.line_total)}
                  </td>
                  {!readOnly && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 transition hover:text-cyan-200"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 transition hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Subtotal</p>
          <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(totals.subtotal)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Tax ({(totals.taxRateDecimal * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%)
          </p>
          <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(totals.taxAmount)}</p>
        </div>
        <div className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-cyan-200">Total</p>
          <p className="mt-1 text-lg font-semibold text-cyan-100">{formatCurrency(totals.total)}</p>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLineItem(null);
        }}
        title={selectedLineItem ? "Edit Line Item" : "Add Line Item"}
      >
        <InvoiceLineItemForm
          lineItem={selectedLineItem || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedLineItem(null);
          }}
          isLoading={isSubmitting || createLineItem.isPending || updateLineItem.isPending}
        />
      </Modal>
    </section>
  );
};
