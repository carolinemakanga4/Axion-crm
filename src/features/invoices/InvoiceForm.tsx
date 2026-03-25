import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Invoice, InvoiceStatus, InvoiceUpsert } from "../../types";
import { useClients } from "../../hooks/useClients";
import { useProjects } from "../../hooks/useProjects";
import PaymentsPanel from "./PaymentsPanel";
import { InvoiceLineItemsPanel } from "./InvoiceLineItemsPanel";

const invoiceSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  client_id: z.string().min(1, "Client is required"),
  project_id: z.string().optional(),
  issue_date: z.string().min(1, "Issue date is required"),
  due_date: z.string().min(1, "Due date is required"),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
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

const inputBaseClass =
  "h-11 w-full rounded-xl border border-white/15 bg-slate-950/80 px-3.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-70";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-200";
const errorClass = "mt-1.5 text-sm text-red-300";

export const InvoiceForm = ({ invoice, onSubmit, onCancel, isLoading }: InvoiceFormProps) => {
  const { data: clients } = useClients();
  const { data: projects } = useProjects();

  const toPercentInput = (storedTaxRate?: number | null) => {
    const raw = Number(storedTaxRate || 0);
    if (!Number.isFinite(raw) || raw <= 0) return "0";
    return raw > 1 ? raw.toString() : (raw * 100).toString();
  };

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
          project_id: invoice.project_id || "",
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          status: invoice.status,
          tax_rate: toPercentInput(invoice.tax_rate),
          notes: invoice.notes || "",
        }
      : undefined,
  });

  const selectedClientId = watch("client_id");
  const taxRatePercent = Number(watch("tax_rate") || 0);
  const taxRateDecimalPreview = Number.isFinite(taxRatePercent) ? taxRatePercent / 100 : 0;

  const clientProjects = useMemo(
    () => projects?.filter((p: { client_id: string }) => p.client_id === selectedClientId) || [],
    [projects, selectedClientId],
  );

  const handleFormSubmit = (data: InvoiceFormData) => {
    const taxPercent = Number(data.tax_rate || 0);
    onSubmit({
      invoice_number: data.invoice_number,
      client_id: data.client_id,
      project_id: data.project_id || null,
      issue_date: data.issue_date,
      due_date: data.due_date,
      status: data.status as InvoiceStatus,
      tax_rate: Number.isFinite(taxPercent) ? taxPercent / 100 : 0,
      notes: data.notes || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-cyan-200">Invoice details</p>
        <p className="mt-1 text-sm text-slate-400">
          Set core billing info, then manage line items for final totals.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="invoice_number" className={labelClass}>
              Invoice Number
            </label>
            <input
              id="invoice_number"
              type="text"
              className={inputBaseClass}
              placeholder="INV-0001"
              {...register("invoice_number")}
            />
            {errors.invoice_number?.message ? (
              <p className={errorClass}>{errors.invoice_number.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select id="status" className={inputBaseClass} {...register("status")}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {errors.status?.message ? <p className={errorClass}>{errors.status.message}</p> : null}
          </div>

          <div>
            <label htmlFor="client_id" className={labelClass}>
              Client
            </label>
            <select id="client_id" className={inputBaseClass} {...register("client_id")}>
              <option value="">Select a client</option>
              {clients?.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {errors.client_id?.message ? <p className={errorClass}>{errors.client_id.message}</p> : null}
          </div>

          <div>
            <label htmlFor="project_id" className={labelClass}>
              Project
            </label>
            <select
              id="project_id"
              disabled={!selectedClientId}
              className={inputBaseClass}
              {...register("project_id")}
            >
              <option value="">No project</option>
              {clientProjects.map((project: { id: string; name: string }) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="issue_date" className={labelClass}>
              Issue Date
            </label>
            <input id="issue_date" type="date" className={inputBaseClass} {...register("issue_date")} />
            {errors.issue_date?.message ? <p className={errorClass}>{errors.issue_date.message}</p> : null}
          </div>

          <div>
            <label htmlFor="due_date" className={labelClass}>
              Due Date
            </label>
            <input id="due_date" type="date" className={inputBaseClass} {...register("due_date")} />
            {errors.due_date?.message ? <p className={errorClass}>{errors.due_date.message}</p> : null}
          </div>

          <div>
            <label htmlFor="tax_rate" className={labelClass}>
              Tax Rate (%)
            </label>
            <input
              id="tax_rate"
              type="number"
              step="0.01"
              className={inputBaseClass}
              {...register("tax_rate")}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <label htmlFor="notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          className="w-full rounded-xl border border-white/15 bg-slate-950/80 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
          placeholder="Optional payment terms or details for the client."
          {...register("notes")}
        />
      </section>

      <InvoiceLineItemsPanel invoiceId={invoice?.id} taxRate={taxRateDecimalPreview} />

      {invoice?.id ? <PaymentsPanel invoiceId={invoice.id} /> : null}

      <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
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
          {isLoading ? "Saving..." : invoice ? "Update invoice" : "Create invoice"}
        </button>
      </div>
    </form>
  );
};
