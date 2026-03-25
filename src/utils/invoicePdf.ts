import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { InvoiceLineItem, InvoiceWithItems } from "../types";

type InvoicePdfData = InvoiceWithItems & {
  clients?: {
    name?: string | null;
    email?: string | null;
    company?: string | null;
  } | null;
};

const formatCurrency = (value: number) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const downloadInvoicePdf = (invoice: InvoicePdfData) => {
  const doc = new jsPDF();
  const lineItems: InvoiceLineItem[] = invoice.line_items || [];
  const subtotal = lineItems.reduce((sum, item) => sum + Number(item.line_total || 0), 0);
  const rawTaxRate = Number(invoice.tax_rate || 0);
  const taxRateDecimal = rawTaxRate > 1 ? rawTaxRate / 100 : rawTaxRate;
  const taxAmount = subtotal * taxRateDecimal;
  const total = subtotal + taxAmount;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("Axion CRM", 14, 17);
  doc.setFontSize(11);
  doc.text("Professional Invoice", 14, 25);

  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.text(`Invoice: ${invoice.invoice_number}`, 14, 48);
  doc.text(`Issue Date: ${format(new Date(invoice.issue_date), "MMM dd, yyyy")}`, 14, 55);
  doc.text(`Due Date: ${format(new Date(invoice.due_date), "MMM dd, yyyy")}`, 14, 62);
  doc.text(`Status: ${invoice.status}`, 14, 69);

  doc.text("Bill To", 140, 48);
  doc.setFontSize(10);
  doc.text(invoice.clients?.name || "Client", 140, 55);
  doc.text(invoice.clients?.company || "", 140, 61);
  doc.text(invoice.clients?.email || "", 140, 67);

  autoTable(doc, {
    startY: 78,
    head: [["Description", "Qty", "Unit Price", "Line Total"]],
    body: lineItems.map((item) => [
      item.description,
      String(item.quantity),
      formatCurrency(item.unit_price),
      formatCurrency(item.line_total),
    ]),
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [248, 250, 252],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || 90;
  const totalsY = finalY + 12;

  doc.setFontSize(10);
  doc.text("Subtotal:", 140, totalsY);
  doc.text(formatCurrency(subtotal), 188, totalsY, { align: "right" });
  doc.text(`Tax (${(taxRateDecimal * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%):`, 140, totalsY + 7);
  doc.text(formatCurrency(taxAmount), 188, totalsY + 7, { align: "right" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total:", 140, totalsY + 16);
  doc.text(formatCurrency(total), 188, totalsY + 16, { align: "right" });
  doc.setFont("helvetica", "normal");

  if (invoice.notes) {
    doc.setFontSize(10);
    doc.text("Notes", 14, totalsY + 20);
    doc.setFontSize(9);
    doc.text(doc.splitTextToSize(invoice.notes, 180), 14, totalsY + 26);
  }

  const safeNumber = (invoice.invoice_number || invoice.id || "invoice").replace(/[^a-zA-Z0-9-_]/g, "-");
  doc.save(`invoice-${safeNumber}.pdf`);
};
