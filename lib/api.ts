// lib/api.ts
import { Invoice } from "@/types/invoice";

export interface ReadInvoicesParams {
  status?: string;
  search?: string;
}

export type CreateInvoicePayload = Omit<
  Invoice,
  "id" | "createdAt" | "updatedAt"
>;

// READ INVOICES
export async function readInvoices(
  filters: ReadInvoicesParams = {},
): Promise<{ invoices: Invoice[] }> {
  const url = new URL("/api/invoices", window.location.origin);

  if (filters.status && filters.status !== "ALL") {
    url.searchParams.append("status", filters.status);
  }
  if (filters.search && filters.search.trim() !== "") {
    url.searchParams.append("search", filters.search.trim());
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch invoices (${response.status})`);
  }

  return response.json();
}

// GET INVOICE BY ID
export async function getInvoiceById(id: string): Promise<Invoice> {
  const url = new URL(`/api/invoices/${id}`, window.location.origin);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch invoice ${id} (${response.status})`);
  }

  return response.json();
}

// UPDATE INVOICE STATUS
export async function updateInvoice(
  id: string,
  updatedFields: Partial<Invoice>,
): Promise<Invoice> {
  const url = new URL(`/api/invoices/${id}`, window.location.origin);

  const response = await fetch(url.toString(), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedFields),
  });

  if (!response.ok) {
    throw new Error(`Failed to update invoice (${response.status})`);
  }

  return response.json();
}

// CREATE INVOICE
export async function createInvoice(
  payload: CreateInvoicePayload,
): Promise<Invoice> {
  const url = new URL("/api/invoices", window.location.origin);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to create invoice (${response.status})`);
  }

  return response.json();
}

// DELETE INVOICE
export async function deleteInvoice(id: string): Promise<void> {
  const url = new URL(`/api/invoices/${id}`, window.location.origin);

  const response = await fetch(url.toString(), {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete invoice (${response.status})`);
  }
}
