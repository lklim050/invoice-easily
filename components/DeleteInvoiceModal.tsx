// components/DeleteInvoiceModal.tsx
"use client";

import { Invoice } from "@/types/invoice";

interface DeleteInvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isPending: boolean;
}

export default function DeleteInvoiceModal({
  invoice,
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: DeleteInvoiceModalProps) {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Message Body */}
        <div className="space-y-2 text-sm text-slate-600">
          <p>
            Are you sure you want to delete invoice{" "}
            <span className="font-semibold text-slate-900">{invoice.id}</span>{" "}
            for{" "}
            <span className="font-semibold text-slate-900">
              {invoice.clientName}
            </span>
            ?
          </p>
          <p className="text-xs text-red-500 font-medium">
            This action cannot be undone.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 border rounded-md text-slate-600 hover:bg-slate-50 text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(invoice.id)}
            disabled={isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs font-medium disabled:opacity-50"
          >
            {isPending ? "Deleting..." : "Delete Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
