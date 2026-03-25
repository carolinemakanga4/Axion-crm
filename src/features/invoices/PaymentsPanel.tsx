import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAddPayment, usePayments } from "../../hooks/usePayments";
import { toast } from "../../utils/toast";

type PaymentsPanelProps = {
  invoiceId: string;
};

const formatCurrency = (value: number) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function PaymentsPanel({ invoiceId }: PaymentsPanelProps) {
  const { user } = useAuth();
  const orgId = user?.profile?.org_id;

  const { data: payments = [], isLoading } = usePayments(invoiceId);
  const addPayment = useAddPayment();

  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<string>("eft");
  const [reference, setReference] = useState<string>("");

  const onAdd = async () => {
    if (!orgId) {
      toast.error("Missing org_id. Profile not loaded yet. Refresh and try again.");
      return;
    }

    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }

    try {
      await addPayment.mutateAsync({
        org_id: orgId,
        invoice_id: invoiceId,
        amount: num,
        method,
        reference: reference || null,
        paid_at: new Date().toISOString(),
        created_by: user?.id ?? null,
      });

      setAmount("");
      setReference("");
      toast.success("Payment added");
    } catch (e: unknown) {
      const error = e as { message?: string };
      toast.error(error?.message ?? "Failed to add payment");
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-white">Payments</h3>
          <p className="text-sm text-slate-400">Record invoice payments and references.</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_1fr_auto]">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          inputMode="decimal"
          className="h-11 rounded-xl border border-white/15 bg-slate-950/80 px-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
        />

        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="h-11 rounded-xl border border-white/15 bg-slate-950/80 px-3.5 text-sm text-slate-100 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
        >
          <option value="eft">EFT</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="other">Other</option>
        </select>

        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Reference (optional)"
          className="h-11 rounded-xl border border-white/15 bg-slate-950/80 px-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
        />

        <button
          type="button"
          onClick={onAdd}
          disabled={addPayment.isPending}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-300 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {addPayment.isPending ? "Adding..." : "Add Payment"}
        </button>
      </div>

      {isLoading ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
          Loading payments...
        </div>
      ) : payments.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-slate-950/60 p-4 text-sm text-slate-400">
          No payments yet.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-slate-950/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  Reference
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-900/40">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {new Date(payment.paid_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm capitalize text-slate-300">
                    {payment.method || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{payment.reference || "-"}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-cyan-100">
                    {formatCurrency(payment.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
