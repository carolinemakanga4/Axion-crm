import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAddPayment, usePayments } from '../../hooks/usePayments';
import { toast } from '../../utils/toast';

type PaymentsPanelProps = {
  invoiceId: string;
};

export default function PaymentsPanel({ invoiceId }: PaymentsPanelProps) {
  const { user } = useAuth();
  const orgId = user?.profile?.org_id;

  const { data: payments = [], isLoading } = usePayments(invoiceId);
  const addPayment = useAddPayment();

  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<string>('eft');
  const [reference, setReference] = useState<string>('');

  const onAdd = async () => {
    if (!orgId) {
      toast.error("Missing org_id. Profile not loaded yet. Refresh and try again.");
      return;
    }

    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      toast.error('Enter a valid payment amount');
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

      setAmount('');
      setReference('');
      toast.success('Payment added');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to add payment');
    }
  };

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h3 style={{ fontWeight: 600, margin: 0 }}>Payments</h3>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, marginBottom: 12 }}>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          inputMode="decimal"
          style={{ padding: 8, width: 120 }}
        />

        <select value={method} onChange={(e) => setMethod(e.target.value)} style={{ padding: 8 }}>
          <option value="eft">EFT</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="other">Other</option>
        </select>

        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Reference (optional)"
          style={{ padding: 8, flex: 1, minWidth: 180 }}
        />

        <button
          type="button"
          onClick={onAdd}
          disabled={addPayment.isPending}
          style={{ padding: '8px 12px' }}
        >
          {addPayment.isPending ? 'Adding…' : 'Add Payment'}
        </button>
      </div>

      {isLoading ? (
        <div>Loading payments…</div>
      ) : payments.length === 0 ? (
        <div style={{ opacity: 0.7 }}>No payments yet.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Date</th>
                <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Method</th>
                <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Reference</th>
                <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>
                    {new Date(p.paid_at).toLocaleString()}
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{p.method ?? '-'}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{p.reference ?? '-'}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>
                    {Number(p.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}