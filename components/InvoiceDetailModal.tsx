// components/InvoiceDetailModal.tsx
"use client";

import { Invoice } from "@/types/invoice";

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoiceDetailModal({
  invoice,
  isOpen,
  onClose,
}: InvoiceDetailModalProps) {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Invoice Summary
            </span>
            <h2 className="text-xl font-bold text-slate-900">{invoice.id}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Client & Date Meta Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg text-xs">
          <div className="space-y-1">
            <p className="text-slate-500 font-medium">Billed To:</p>
            <p className="font-semibold text-slate-900 text-sm">
              {invoice.clientName}
            </p>
            <p className="text-slate-600">{invoice.clientEmail}</p>
          </div>
          <div className="space-y-1 sm:text-right">
            <p className="text-slate-600">
              <span className="text-slate-500 font-medium">Issue Date:</span>{" "}
              {invoice.issueDate}
            </p>
            <p className="text-slate-600">
              <span className="text-slate-500 font-medium">Due Date:</span>{" "}
              {invoice.dueDate}
            </p>
            <div className="pt-1">
              <span
                className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] ${
                  invoice.status === "PAID"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : invoice.status === "OVERDUE"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : invoice.status === "SENT"
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : invoice.status === "VOID"
                          ? "bg-gray-100 text-gray-600 border border-gray-300"
                          : "bg-slate-200 text-slate-700"
                }`}
              >
                {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-800 text-sm">Line Items</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b">
                <tr>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Unit Price</th>
                  <th className="p-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {invoice.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-medium">{item.description}</td>
                    <td className="p-2.5 text-center">{item.quantity}</td>
                    <td className="p-2.5 text-right">
                      ${item.unitPrice.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right font-medium">
                      ${item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Breakdown */}
        <div className="bg-slate-50 p-4 rounded-lg space-y-1.5 text-right text-xs">
          <div className="text-slate-600">
            Subtotal:{" "}
            <span className="font-medium">
              ${invoice.subtotal.toLocaleString()}
            </span>
          </div>
          <div className="text-slate-600">
            Tax ({(invoice.taxRate * 100).toFixed(0)}% GST):{" "}
            <span className="font-medium">
              ${invoice.taxAmount.toLocaleString()}
            </span>
          </div>
          <div className="text-slate-900 text-base font-bold pt-1.5 border-t border-slate-200">
            Total Amount: ${invoice.totalAmount.toLocaleString()}
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="text-xs bg-slate-50 p-3 rounded-lg border text-slate-600">
            <span className="font-semibold text-slate-700 block mb-0.5">
              Notes / Terms:
            </span>
            {invoice.notes}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 border text-slate-700 rounded-md hover:bg-slate-200 text-xs font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
