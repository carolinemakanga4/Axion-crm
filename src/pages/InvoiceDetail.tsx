import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Edit } from "lucide-react";
import { format } from "date-fns";
import { useInvoice, useUpdateInvoice } from "../hooks/useInvoices";
import { LoadingSpinner } from "../components/Loading";
import { Modal } from "../components/Modal";
import { InvoiceForm } from "../features/invoices/InvoiceForm";
import { InvoiceUpsert } from "../types";
import { downloadInvoicePdf } from "../utils/invoicePdf";
import { InvoiceLineItemsPanel } from "../features/invoices/InvoiceLineItemsPanel";

const statusStyles: Record<string, string> = {
  paid: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
  sent: "border-blue-300/30 bg-blue-400/10 text-blue-200",
  overdue: "border-red-300/30 bg-red-400/10 text-red-200",
  draft: "border-slate-300/20 bg-slate-400/10 text-slate-200",
  cancelled: "border-slate-300/20 bg-slate-400/10 text-slate-300",
};

export const InvoiceDetail = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { data: invoice, isLoading } = useInvoice(id);
  const updateInvoice = useUpdateInvoice();

  if (isLoading) return <LoadingSpinner />;

  if (!invoice) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/50 p-8 text-center text-slate-300">
        Invoice not found.
      </div>
    );
  }

  const subtotal = (invoice.line_items || []).reduce(
    (sum, item) => sum + Number(item.line_total || 0),
    0,
  );
  const rawTaxRate = Number(invoice.tax_rate || 0);
  const taxRateDecimal = rawTaxRate > 1 ? rawTaxRate / 100 : rawTaxRate;
  const taxAmount = subtotal * taxRateDecimal;
  const total = subtotal + taxAmount;

  const handleUpdateInvoice = async (data: InvoiceUpsert) => {
    await updateInvoice.mutateAsync({ id: invoice.id, ...data });
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate("/invoices")}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to invoices
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadInvoicePdf(invoice)}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-300/15"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-300 hover:to-blue-400"
          >
            <Edit className="h-4 w-4" />
            Edit invoice
          </button>
        </div>
      </div>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-slate-900 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Invoice</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">{invoice.invoice_number}</h1>
            <p className="mt-2 text-sm text-slate-300">
              Client: {(invoice as { clients?: { name?: string } }).clients?.name || "Unknown"}
            </p>
            <p className="text-sm text-slate-400">
              Issue {format(new Date(invoice.issue_date), "MMM dd, yyyy")} - Due{" "}
              {format(new Date(invoice.due_date), "MMM dd, yyyy")}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] ${
              statusStyles[invoice.status] || statusStyles.draft
            }`}
          >
            {invoice.status}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Subtotal</p>
          <p className="mt-1 text-xl font-semibold text-white">
            ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Tax ({(taxRateDecimal * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%)
          </p>
          <p className="mt-1 text-xl font-semibold text-white">
            ${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </article>
        <article className="rounded-2xl border border-cyan-300/30 bg-cyan-400/10 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-cyan-200">Total</p>
          <p className="mt-1 text-xl font-semibold text-cyan-100">
            ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </article>
      </section>

      <InvoiceLineItemsPanel invoiceId={invoice.id} taxRate={taxRateDecimal} />

      {invoice.notes ? (
        <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
          <h2 className="text-base font-semibold text-white">Notes</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{invoice.notes}</p>
        </section>
      ) : null}

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Invoice"
        size="lg"
      >
        <InvoiceForm
          invoice={invoice}
          onSubmit={handleUpdateInvoice}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={updateInvoice.isPending}
        />
      </Modal>
    </div>
  );
};
