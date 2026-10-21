// app/page.tsx
"use client";

import { Suspense, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  readInvoices,
  updateInvoice,
  deleteInvoice,
  CreateInvoicePayload,
  createInvoice,
} from "@/lib/api";
import { Invoice, InvoiceStatus } from "@/types/invoice";
import CreateInvoiceModal from "@/components/CreateInvoiceModal";
import DeleteInvoiceModal from "@/components/DeleteInvoiceModal";
import InvoiceDetailModal from "@/components/InvoiceDetailModal";
import UpdateInvoiceModal from "@/components/UpdateInvoiceModal";

function InvoiceConsoleContent() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // READ QUERY
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["invoices", statusFilter, searchQuery],
    queryFn: () => readInvoices({ status: statusFilter, search: searchQuery }),
  });

  // FULL UPDATE MUTATION (Modal)
  const updateInvoiceMutation = useMutation({
    mutationFn: ({
      id,
      updatedInvoice,
    }: {
      id: string;
      updatedInvoice: Invoice;
    }) => updateInvoice(id, updatedInvoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setIsUpdateModalOpen(false);
      setEditingInvoice(null);
    },
  });

  // QUICK STATUS MUTATION (Table Dropdown)
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      updateInvoice(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  // DELETE MUTATION
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setIsDeleteModalOpen(false);
      setInvoiceToDelete(null);
    },
  });

  // CREATE MUTATION
  const createMutation = useMutation({
    mutationFn: (payload: CreateInvoicePayload) => createInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setIsCreateModalOpen(false);
    },
  });

  if (isLoading)
    return <div className="p-8 text-center text-sm">Loading invoices...</div>;
  if (isError)
    return (
      <div className="p-8 text-red-500">Error: {(error as Error).message}</div>
    );

  const invoices = data?.invoices || [];

  // Summary Metrics
  const totalRevenue = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((acc, inv) => acc + inv.totalAmount, 0);

  const pendingAmount = invoices
    .filter((inv) => inv.status === "SENT")
    .reduce((acc, inv) => acc + inv.totalAmount, 0);

  const overdueAmount = invoices
    .filter((inv) => inv.status === "OVERDUE")
    .reduce((acc, inv) => acc + inv.totalAmount, 0);

  return (
    <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Invoice Management Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Track and manage client invoices and lifecycle statuses.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          + Create Invoice
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <p className="text-xs text-slate-500 font-medium">
            Collected Revenue
          </p>
          <p className="text-2xl font-bold text-green-600">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Pending Payments</p>
          <p className="text-2xl font-bold text-blue-600">
            ${pendingAmount.toLocaleString()}
          </p>
        </div>
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Overdue Balance</p>
          <p className="text-2xl font-bold text-red-600">
            ${overdueAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search client or invoice #..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm w-full sm:w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="VOID">Void</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="w-full overflow-x-auto border rounded-lg shadow-sm bg-white">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b text-slate-600 font-semibold">
            <tr>
              <th className="p-3">Invoice #</th>
              <th className="p-3">Client</th>
              <th className="p-3">Issue Date</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Total Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-slate-500">
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((inv: Invoice) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td
                    onClick={() => {
                      setViewingInvoice(inv);
                      setIsDetailModalOpen(true);
                    }}
                    className="p-3 font-medium text-blue-600 hover:underline cursor-pointer"
                  >
                    {inv.id}
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-slate-800">
                      {inv.clientName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {inv.clientEmail}
                    </div>
                  </td>
                  <td className="p-3">{inv.issueDate}</td>
                  <td className="p-3">{inv.dueDate}</td>
                  <td className="p-3 font-medium">
                    ${inv.totalAmount.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <select
                      value={inv.status}
                      onChange={(e) =>
                        updateStatusMutation.mutate({
                          id: inv.id,
                          status: e.target.value as InvoiceStatus,
                        })
                      }
                      className={`text-xs px-2 py-1 rounded font-semibold border ${
                        inv.status === "PAID"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : inv.status === "OVERDUE"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : inv.status === "SENT"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : inv.status === "VOID"
                                ? "bg-gray-100 text-gray-500 border-gray-300"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="SENT">SENT</option>
                      <option value="PAID">PAID</option>
                      <option value="OVERDUE">OVERDUE</option>
                      <option value="VOID">VOID</option>
                    </select>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingInvoice(inv);
                        setIsUpdateModalOpen(true);
                      }}
                      disabled={inv.status !== "DRAFT"}
                      title={
                        inv.status !== "DRAFT"
                          ? "Only draft invoices can be edited"
                          : "Edit Invoice"
                      }
                      className={`text-xs font-medium ${
                        inv.status === "DRAFT"
                          ? "text-blue-600 hover:underline cursor-pointer"
                          : "text-slate-400 cursor-not-allowed opacity-50"
                      }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setInvoiceToDelete(inv);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:underline text-xs font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(payload) => createMutation.mutate(payload)}
        isPending={createMutation.isPending}
      />
      <DeleteInvoiceModal
        invoice={invoiceToDelete}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setInvoiceToDelete(null);
        }}
        onConfirm={(id) => deleteMutation.mutate(id)}
        isPending={deleteMutation.isPending}
      />
      <InvoiceDetailModal
        invoice={viewingInvoice}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setViewingInvoice(null);
        }}
      />
      <UpdateInvoiceModal
        invoice={editingInvoice}
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setEditingInvoice(null);
        }}
        onSubmit={(id, updatedInvoice) =>
          updateInvoiceMutation.mutate({ id, updatedInvoice })
        }
        isPending={updateInvoiceMutation.isPending}
      />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs">Loading dashboard...</div>
      }
    >
      <InvoiceConsoleContent />
    </Suspense>
  );
}
