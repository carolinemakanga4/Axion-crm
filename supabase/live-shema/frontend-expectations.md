# Axion CRM frontend expectations

## General
- authenticated users must be able to view and manage their own CRM data
- app uses React + TypeScript + Supabase
- frontend should not hang if backend function/policy is missing
- all save flows must return clear errors

## Invoices
- invoices.id is uuid
- invoices.client_id links to clients.id
- invoices have subtotal, tax_rate, tax_amount, total
- tax_rate is stored as decimal (example 0.15)

## Invoice line items
- invoice_line_items.id is uuid
- invoice_line_items.invoice_id links to invoices.id
- required fields:
  - description
  - quantity
  - unit_price
  - line_total

## Invoice logic
- line_total = quantity * unit_price
- subtotal = sum of invoice line items
- tax_amount = subtotal * tax_rate
- total = subtotal + tax_amount

## UX expectations
- user creates invoice first
- user can later add line items
- saving a line item must not reload the page
- save must not hang on "Saving..."
- after saving a line item, invoice totals should refresh
- PDF should use saved invoice + saved line items