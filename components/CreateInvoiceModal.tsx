// components/CreateInvoiceModal.tsx
"use client";

import { useState } from "react";
import { CreateInvoicePayload } from "@/lib/api";
import { InvoiceStatus, LineItem } from "@/types/invoice";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateInvoicePayload) => void;
  isPending: boolean;
}

const DEFAULT_TAX_RATE = 0.09; // 9% GST/Tax

export default function CreateInvoiceModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
}: CreateInvoiceModalProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<InvoiceStatus>("DRAFT");
  const [notes, setNotes] = useState("");

  // Line items state
  const [items, setItems] = useState<Omit<LineItem, "id">[]>([
    { description: "", quantity: 1, unitPrice: 0, amount: 0 },
  ]);

  if (!isOpen) return null;

  // Calculate Subtotal, Tax, and Total
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxAmount = Math.round(subtotal * DEFAULT_TAX_RATE * 100) / 100;
  const totalAmount = subtotal + taxAmount;

  // Handle line item field changes
  const handleItemChange = (
    index: number,
    field: keyof Omit<LineItem, "id">,
    value: string | number,
  ) => {
    const updatedItems = [...items];
    const currentItem = { ...updatedItems[index], [field]: value };

    // Auto-calculate line item amount
    if (field === "quantity" || field === "unitPrice") {
      const qty = Number(currentItem.quantity) || 0;
      const price = Number(currentItem.unitPrice) || 0;
      currentItem.amount = qty * price;
    }

    updatedItems[index] = currentItem;
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0, amount: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return; // Retain at least 1 line item
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedItems: LineItem[] = items.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      amount: Number(item.amount),
    }));

    const payload: CreateInvoicePayload = {
      clientName,
      clientEmail,
      issueDate,
      dueDate,
      items: formattedItems,
      subtotal,
      taxRate: DEFAULT_TAX_RATE,
      taxAmount,
      totalAmount,
      status,
      notes: notes.trim() || undefined,
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-xl font-bold text-slate-900">
            Create New Invoice
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Client Name *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full border rounded-md px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Client Email *
              </label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="billing@acme.com"
                className="w-full border rounded-md px-3 py-2 text-slate-800"
              />
            </div>
          </div>

          {/* Dates & Initial Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Issue Date *
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                className="w-full border rounded-md px-3 py-2 text-slate-800"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="SENT">SENT</option>
                <option value="PAID">PAID</option>
              </select>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-semibold text-slate-800">Line Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                + Add Row
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  required
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                  className="flex-1 border rounded-md px-2 py-1.5 text-xs text-slate-800"
                />
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", Number(e.target.value))
                  }
                  className="w-16 border rounded-md px-2 py-1.5 text-xs text-slate-800 text-center"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="Price"
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleItemChange(index, "unitPrice", Number(e.target.value))
                  }
                  className="w-24 border rounded-md px-2 py-1.5 text-xs text-slate-800 text-right"
                />
                <div className="w-24 text-right font-medium text-xs text-slate-700">
                  ${(item.amount || 0).toLocaleString()}
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-700 font-bold px-1 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Dynamic Totals Summary */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-1 text-right text-xs">
            <div className="text-slate-600">
              Subtotal:{" "}
              <span className="font-medium">${subtotal.toLocaleString()}</span>
            </div>
            <div className="text-slate-600">
              Tax (9% GST):{" "}
              <span className="font-medium">${taxAmount.toLocaleString()}</span>
            </div>
            <div className="text-slate-900 text-sm font-bold pt-1 border-t border-slate-200">
              Total: ${totalAmount.toLocaleString()}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Notes / Terms
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Net 30 payment terms."
              className="w-full border rounded-md px-3 py-2 text-slate-800 text-xs"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-slate-600 border rounded-md hover:bg-slate-50 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-medium disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
