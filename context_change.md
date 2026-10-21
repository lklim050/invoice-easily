## Summary

- This documents provides a summary of changes made to the context of this project from insurance policy console to invoice system lifecycle management.

## Checklist

- Step 1: Mock API setup via MSW
  - This is to replace the backend external API calls with a mock API for demo purpose
- Step 2: Rename types and data models
  - This is to rename the types and data models from insurance policy to invoice system lifecycle management
- Step 3: Update React components
- Step 4: Polish UI and UX

## Step 1: Mock API setup via MSW

- Install & Initialize MSW.

- Define the Data Model & Mock Dataset: Create mockInvoices.ts containing realistic seed data (line items, subtotals, tax rates, and statuses like DRAFT, SENT, OVERDUE, PAID, VOID).

- Rewrite the API Endpoints (MSW Handlers): Re-implement all REST routes (GET, POST, PATCH, DELETE) to query and mutate your in-memory mock dataset locally.

- Wire Up Browser Interception: Set up the service worker worker file in your Next.js frontend (typically inside a custom provider or app/layout.tsx for dev mode) so all standard fetch or TanStack Query requests get intercepted cleanly in the browser.

### Target files

- `lib/mocks/data.ts` - Contains the mock dataset for invoices.
- `lib/mocks/handlers.ts` - Contains the MSW handlers for API endpoints.
- `lib/mocks/browser.ts` - Sets up the MSW service worker for browser interception.
- `providers/MockApiProvider.tsx` - A React provider that initializes the MSW service worker in development mode.

### What is MSW?

MSW (Mock Service Worker) is a library that allows you to mock API requests in your frontend applications during development. It works by intercepting network requests made by your application and returning predefined responses, enabling you to test your application without relying on a real backend. Such setup consists of the following:

- **Handlers**: Define how to respond to specific API requests (e.g., GET, POST, PATCH, DELETE).
- **Service Worker**: A script that runs in the browser and intercepts network requests, allowing you to return mock responses defined in your handlers.
- **Integration**: You can integrate MSW into your frontend application (e.g., React, Next.js) to intercept requests made by your components or libraries like TanStack Query by wrapping your app with a provider that initializes the service worker.
- **Temporary DB**: You can maintain an in-memory database (e.g., an array of objects) to simulate data persistence during development. This allows you to test CRUD operations without a real backend. As such mock data can be seeded and remain consistent and intact across different requests during the development session.

### Pre. Install and Initialize MSW

```bash
npm i -D msw
npx msw init ./public
```

- This would create a `mockServiceWorker.js` file in the public folder.

- During initialization MSW will prompt you to choose a directory for the service worker file. You can accept the default `public` directory by pressing Y.

```
Continue by describing the network in your application:


https://mswjs.io/docs/quick-start

      INFO In order to ease the future updates to the worker script,
      we recommend saving the path to the worker directory in your package.json.
? Do you wish to save "public" as the worker directory? (Y/n)
```

### 1. Define Types

```typescript
// types/invoice.ts
export type InvoiceStatus = "DRAFT" | "SENT" | "OVERDUE" | "PAID" | "VOID";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number; // quantity * unitPrice
}

export interface Invoice {
  id: string; // e.g. "INV-2026-001"
  clientName: string;
  clientEmail: string;
  issueDate: string; // ISO date string YYYY-MM-DD
  dueDate: string; // ISO date string YYYY-MM-DD
  items: LineItem[];
  subtotal: number;
  taxRate: number; // e.g. 0.09 for 9% GST
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2. Seed Mock Data

```typescript
// lib/mocks/data.ts
import { Invoice } from "@/types/invoice";

export const initialInvoices: Invoice[] = [
  {
    id: "INV-2026-001",
    clientName: "Acme Corporation",
    clientEmail: "billing@acme.com",
    issueDate: "2026-09-15",
    dueDate: "2026-10-15",
    items: [
      {
        id: "item-1",
        description: "Frontend Development (Next.js)",
        quantity: 40,
        unitPrice: 100,
        amount: 4000,
      },
      {
        id: "item-2",
        description: "UI/UX Design Retainer",
        quantity: 1,
        unitPrice: 1200,
        amount: 1200,
      },
    ],
    subtotal: 5200,
    taxRate: 0.09,
    taxAmount: 468,
    totalAmount: 5668,
    status: "SENT",
    notes: "Net 30 payment terms.",
    createdAt: "2026-09-15T08:00:00Z",
    updatedAt: "2026-09-15T08:00:00Z",
  },
  {
    id: "INV-2026-002",
    clientName: "Starlight Medical Inc.",
    clientEmail: "finance@starlightmed.com",
    issueDate: "2026-08-01",
    dueDate: "2026-09-01",
    items: [
      {
        id: "item-3",
        description: "Industrial X-Ray Calibration Service",
        quantity: 2,
        unitPrice: 1500,
        amount: 3000,
      },
    ],
    subtotal: 3000,
    taxRate: 0.09,
    taxAmount: 270,
    totalAmount: 3270,
    status: "OVERDUE",
    notes: "Urgent: Payment past due date.",
    createdAt: "2026-08-01T09:30:00Z",
    updatedAt: "2026-09-02T00:00:00Z",
  },
  {
    id: "INV-2026-003",
    clientName: "Nexus Tech Solutions",
    clientEmail: "accounts@nexustech.io",
    issueDate: "2026-09-20",
    dueDate: "2026-10-20",
    items: [
      {
        id: "item-4",
        description: "Cloud Infrastructure Migration",
        quantity: 1,
        unitPrice: 8500,
        amount: 8500,
      },
    ],
    subtotal: 8500,
    taxRate: 0.09,
    taxAmount: 765,
    totalAmount: 9265,
    status: "PAID",
    notes: "Paid via direct bank transfer.",
    createdAt: "2026-09-20T10:15:00Z",
    updatedAt: "2026-09-25T14:20:00Z",
  },
  {
    id: "INV-2026-004",
    clientName: "Apex Logistics",
    clientEmail: "contact@apexlogistics.com",
    issueDate: "2026-10-01",
    dueDate: "2026-11-01",
    items: [
      {
        id: "item-5",
        description: "Custom API Integration Draft",
        quantity: 15,
        unitPrice: 120,
        amount: 1800,
      },
    ],
    subtotal: 1800,
    taxRate: 0.09,
    taxAmount: 162,
    totalAmount: 1962,
    status: "DRAFT",
    createdAt: "2026-10-01T11:00:00Z",
    updatedAt: "2026-10-01T11:00:00Z",
  },
];
```

### 3. Implement MSW Handlers

These handlers intercept your API requests (/api/invoices) and mutate our in-memory invoicesDB array:

```typescript
// lib/mocks/handlers.ts
import { http, HttpResponse, delay } from "msw";
import { initialInvoices } from "./data";
import { Invoice, InvoiceStatus } from "@/types/invoice";

// In-memory store
let invoicesDB: Invoice[] = [...initialInvoices];

export const handlers = [
  // 1. GET /api/invoices (Supports status filter & search query)
  http.get("/api/invoices", async ({ request }) => {
    await delay(400); // Simulate network latency

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");
    const searchQuery = url.searchParams.get("search")?.toLowerCase();

    let filtered = [...invoicesDB];

    if (statusFilter && statusFilter !== "ALL") {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (inv) =>
          inv.clientName.toLowerCase().includes(searchQuery) ||
          inv.id.toLowerCase().includes(searchQuery),
      );
    }

    return HttpResponse.json({ invoices: filtered });
  }),

  // 2. GET /api/invoices/:id
  http.get("/api/invoices/:id", async ({ params }) => {
    await delay(300);
    const { id } = params;
    const invoice = invoicesDB.find((inv) => inv.id === id);

    if (!invoice) {
      return HttpResponse.json(
        { message: "Invoice not found" },
        { status: 404 },
      );
    }

    return HttpResponse.json(invoice);
  }),

  // 3. POST /api/invoices (Create new invoice)
  http.post("/api/invoices", async ({ request }) => {
    await delay(500);
    // await returns Promise as parsing json takes time.
    // Omit is TypeScript utility that convert Invoice type to a new type without the specified keys.
    // as is type assertion that tells TypeScript to treat the value as a specific type.
    const body = (await request.json()) as Omit<
      Invoice,
      "id" | "createdAt" | "updatedAt"
    >;

    const newInvoice: Invoice = {
      ...body,
      id: `INV-2026-00${invoicesDB.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // unshift adds new entry to the start of array so that new entry when mapped will be displayed at the top of the list.
    invoicesDB.unshift(newInvoice);
    return HttpResponse.json(newInvoice, { status: 201 });
  }),

  // 4. PATCH /api/invoices/:id/status (Lifecycle State Machine Transitions)
  http.patch("/api/invoices/:id/status", async ({ params, request }) => {
    await delay(400);
    const { id } = params;
    const { status } = (await request.json()) as { status: InvoiceStatus };

    const index = invoicesDB.findIndex((inv) => inv.id === id);
    if (index === -1) {
      return HttpResponse.json(
        { message: "Invoice not found" },
        { status: 404 },
      );
    }

    // Update status and timestamp
    invoicesDB[index] = {
      ...invoicesDB[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(invoicesDB[index]);
  }),

  // 5. DELETE /api/invoices/:id
  http.delete("/api/invoices/:id", async ({ params }) => {
    await delay(300);
    const { id } = params;

    invoicesDB = invoicesDB.filter((inv) => inv.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),
];
```

### 4. Setup Browser Worker

```typescript
// lib/mocks/browser.ts
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// creates a client-side Service Worker manager
// that later intercepts requests and returns mock responses defined in handlers when worker.start() is called in the client integration provider.
export const worker = setupWorker(...handlers);
```

### 5. Client Integration Provider

```typescript
// /components/providers/MSWProvider.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";

export function MSWProvider({ children }: { children: ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    async function initMSW() {
      // below check is to ensure that MSW is only initialized in the browser environment and not during server-side rendering (SSR) in Next.js.
      if (typeof window !== "undefined") {
        const { worker } = await import("@/lib/mocks/browser");
        await worker.start({
          // This option allows unhandled requests (does not match our handlers) to bypass the service worker and reach the actual network, which is useful for development and debugging.
          onUnhandledRequest: "bypass",
        });
        setMswReady(true);
      }
    }

    initMSW();
  }, []);

  if (!mswReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-sm text-gray-500">Initializing Mock API environment...</p>
      </div>
    );
  }

  return <>{children}</>;
}

```

### 6. Wrap your app with MSWProvider

- Note below might be different depending on your version. Important note is to MSWProvider wrap QueryProvider so that all requests made by TanStack Query are intercepted by MSW.

```typescript
// app/layout.tsx
import { MSWProvider } from "@/components/MSWProvider";
import { QueryProvider } from "@/components/QueryProvider";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MSWProvider>
          <QueryProvider>{children}</QueryProvider>
        </MSWProvider>
      </body>
    </html>
  );
}
```

## Step 2: Rename types and data models

- Rewrite the whole api methods in api.ts to reflect the invoice system lifecycle management context.
- Update the react components in page.tsx to reflect the invoice system lifecycle management context.

### Target files to adjust:

- api.ts
- page.tsx
- CreateInvoiceModal.tsx (Originally named CreatePolicyModal.tsx)

### 1. Adjust api.ts

Adjustments as follows:

- 1. Modify the interface names and types to reflect the invoice system lifecycle management context.

```typescript
// lib/api.ts
import { Invoice, InvoiceStatus, LineItem } from "@/types/invoice";

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
export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus,
): Promise<Invoice> {
  const url = new URL(`/api/invoices/${id}`, window.location.origin);

  const response = await fetch(url.toString(), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update invoice status (${response.status})`);
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
```

### 2. Adjust page.tsx

```typescript
// app/page.tsx
"use client";

import { Suspense, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { readInvoices, updateInvoiceStatus, deleteInvoice, createInvoice } from "@/lib/api";
import { Invoice, InvoiceStatus } from "@/types/invoice";

function InvoiceConsoleContent() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const queryClient = useQueryClient();

  // READ QUERY
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["invoices", statusFilter, searchQuery],
    queryFn: () => readInvoices({ status: statusFilter, search: searchQuery }),
  });

  // UPDATE STATUS MUTATION
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      updateInvoiceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  // DELETE MUTATION
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  if (isLoading) return <div className="p-8 text-center text-sm">Loading invoices...</div>;
  if (isError) return <div className="p-8 text-red-500">Error: {(error as Error).message}</div>;

  const invoices = data?.invoices || [];

  return (
    <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Invoice Management Dashboard
          </h1>
          <p className="text-sm text-slate-500">Track and manage client invoices and lifecycle statuses.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
          + Create Invoice
        </button>
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
        </select>
      </div>

      {/* Invoices Table */}
      <div className="w-full overflow-x-auto border rounded-lg shadow-sm">
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
                  <td className="p-3 font-medium text-slate-900">{inv.id}</td>
                  <td className="p-3">
                    <div className="font-medium text-slate-800">{inv.clientName}</div>
                    <div className="text-xs text-slate-500">{inv.clientEmail}</div>
                  </td>
                  <td className="p-3">{inv.issueDate}</td>
                  <td className="p-3">{inv.dueDate}</td>
                  <td className="p-3 font-medium">${inv.totalAmount.toLocaleString()}</td>
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
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="SENT">SENT</option>
                      <option value="PAID">PAID</option>
                      <option value="OVERDUE">OVERDUE</option>
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => deleteMutation.mutate(inv.id)}
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
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading dashboard...</div>}>
      <InvoiceConsoleContent />
    </Suspense>
  );
}
```

## Step 3. Adjust Create Modal

- The following is CreateInvoiceModal.tsx:

```typescript
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
    new Date().toISOString().split("T")[0]
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
    value: string | number
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
          <h2 className="text-xl font-bold text-slate-900">Create New Invoice</h2>
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
              Subtotal: <span className="font-medium">${subtotal.toLocaleString()}</span>
            </div>
            <div className="text-slate-600">
              Tax (9% GST): <span className="font-medium">${taxAmount.toLocaleString()}</span>
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
```

- Then wire up in page.tsx

1. Add state for modal open/close:

```typescript
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
```

2. Add createMutation:

```typescript
// CREATE MUTATION
const createMutation = useMutation({
  mutationFn: (payload: CreateInvoicePayload) => createInvoice(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    setIsCreateModalOpen(false);
  },
});
```

3. Add onClick handler for "Create Invoice" button:

```typescript
onClick={() => setIsCreateModalOpen(true)}

```

4. Just before the main closing tag, add the CreateInvoiceModal component:

```typescript
<CreateInvoiceModal
  isOpen={isCreateModalOpen}
  onClose={() => setIsCreateModalOpen(false)}
  onSubmit={(payload) => createMutation.mutate(payload)}
  isPending={createMutation.isPending}
/>
```

## Step 4. Adjust Delete Confirmation Modal

- The following is for Delete Modal

```typescript
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
            <span className="font-semibold text-slate-900">{invoice.id}</span> for{" "}
            <span className="font-semibold text-slate-900">{invoice.clientName}</span>?
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
```

- Next wire up in page.tsx

1. Add state for delete modal open/close and selected invoice:

```typescript
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
```

2. Update deleteMutation to set selected invoice and open modal:

```typescript
const deleteMutation = useMutation({
  mutationFn: (id: string) => deleteInvoice(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    setIsDeleteModalOpen(false);
    setInvoiceToDelete(null);
  },
});
```

3. Update the delete button in the table to set selected invoice and open modal:

```typescript
<button
  onClick={() => {
    setInvoiceToDelete(inv);
    setIsDeleteModalOpen(true);
  }}
  className="text-red-600 hover:underline text-xs font-medium"
>
  Delete
</button>
```

4. Just before the main closing tag, add the DeleteInvoiceModal component:

```typescript
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
```

## Step 5. Adjust Detail Modal

```typescript
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
            className="text-slate-400 hover:text-slate-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Client & Date Meta Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg text-xs">
          <div className="space-y-1">
            <p className="text-slate-500 font-medium">Billed To:</p>
            <p className="font-semibold text-slate-900 text-sm">{invoice.clientName}</p>
            <p className="text-slate-600">{invoice.clientEmail}</p>
          </div>
          <div className="space-y-1 sm:text-right">
            <p className="text-slate-600">
              <span className="text-slate-500 font-medium">Issue Date:</span> {invoice.issueDate}
            </p>
            <p className="text-slate-600">
              <span className="text-slate-500 font-medium">Due Date:</span> {invoice.dueDate}
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
                    <td className="p-2.5 text-right">${item.unitPrice.toLocaleString()}</td>
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
            Subtotal: <span className="font-medium">${invoice.subtotal.toLocaleString()}</span>
          </div>
          <div className="text-slate-600">
            Tax ({(invoice.taxRate * 100).toFixed(0)}% GST):{" "}
            <span className="font-medium">${invoice.taxAmount.toLocaleString()}</span>
          </div>
          <div className="text-slate-900 text-base font-bold pt-1.5 border-t border-slate-200">
            Total Amount: ${invoice.totalAmount.toLocaleString()}
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="text-xs bg-slate-50 p-3 rounded-lg border text-slate-600">
            <span className="font-semibold text-slate-700 block mb-0.5">Notes / Terms:</span>
            {invoice.notes}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 border text-slate-700 rounded-md hover:bg-slate-200 text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

```

- Wire to page.tsx

1. Add state for detail modal open/close and selected invoice:

```typescript
const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
```

2. Update the invoice row to open detail modal on click:

```typescript
<td
  className="p-3 font-medium text-blue-600 hover:underline cursor-pointer"
  onClick={() => {
    setViewingInvoice(inv);
    setIsDetailModalOpen(true);
  }}
>
  {inv.id}
</td>
```

3. Just before the main closing tag, add the InvoiceDetailModal component:

```typescript
<InvoiceDetailModal
  invoice={viewingInvoice}
  isOpen={isDetailModalOpen}
  onClose={() => {
    setIsDetailModalOpen(false);
    setViewingInvoice(null);
  }}
/>
```

## Step 6. Adjust Update Modal

```typescript
// components/UpdateInvoiceModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Invoice, InvoiceStatus, LineItem } from "@/types/invoice";

interface UpdateInvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, updatedInvoice: Invoice) => void;
  isPending: boolean;
}

export default function UpdateInvoiceModal({
  invoice,
  isOpen,
  onClose,
  onSubmit,
  isPending,
}: UpdateInvoiceModalProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<InvoiceStatus>("DRAFT");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);

  // Pre-fill form state when an invoice is passed in
  useEffect(() => {
    if (invoice) {
      setClientName(invoice.clientName);
      setClientEmail(invoice.clientEmail);
      setIssueDate(invoice.issueDate);
      setDueDate(invoice.dueDate);
      setStatus(invoice.status);
      setNotes(invoice.notes || "");
      setItems(invoice.items || []);
    }
  }, [invoice]);

  if (!isOpen || !invoice) return null;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxRate = invoice.taxRate ?? 0.09;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const totalAmount = subtotal + taxAmount;

  const handleItemChange = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    const updatedItems = [...items];
    const currentItem = { ...updatedItems[index], [field]: value };

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
      {
        id: `item-${Date.now()}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedInvoice: Invoice = {
      ...invoice,
      clientName,
      clientEmail,
      issueDate,
      dueDate,
      status,
      items,
      subtotal,
      taxAmount,
      totalAmount,
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onSubmit(invoice.id, updatedInvoice);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Edit Invoice
            </span>
            <h2 className="text-xl font-bold text-slate-900">{invoice.id}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Client Info */}
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
                className="w-full border rounded-md px-3 py-2 text-slate-800"
              />
            </div>
          </div>

          {/* Dates & Status */}
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
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                className="w-full border rounded-md px-3 py-2 text-slate-800"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="SENT">SENT</option>
                <option value="PAID">PAID</option>
                <option value="OVERDUE">OVERDUE</option>
                <option value="VOID">VOID</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
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
              <div key={item.id || index} className="flex gap-2 items-center">
                <input
                  type="text"
                  required
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

          {/* Totals Summary */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-1 text-right text-xs">
            <div className="text-slate-600">
              Subtotal: <span className="font-medium">${subtotal.toLocaleString()}</span>
            </div>
            <div className="text-slate-600">
              Tax ({(taxRate * 100).toFixed(0)}% GST):{" "}
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
              className="w-full border rounded-md px-3 py-2 text-slate-800 text-xs"
            />
          </div>

          {/* Modal Footer */}
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
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- Wire to page.tsx

1. Add state for update modal open/close and selected invoice:

```typescript
const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
```

2. Changes to the api.ts for updateInvoice function so that it can be used for both full update and quick status update:

```typescript
// lib/api.ts
import { Invoice } from "@/types/invoice";

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
```

3. Add updateInvoiceMutation and edit the status mutation:

```typescript
// app/page.tsx
import { updateInvoice } from "@/lib/api";

// ... inside InvoiceConsoleContent ...

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
```

4. Add an edit button in the invoice row to open the update modal:

```typescript
<td className="p-3 text-right space-x-2">
  <button
    onClick={() => {
      setEditingInvoice(inv);
      setIsUpdateModalOpen(true);
    }}
    disabled={inv.status !== "DRAFT"}
    title={inv.status !== "DRAFT" ? "Only draft invoices can be edited" : "Edit Invoice"}
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
```

5. Just before the main closing tag, add the UpdateInvoiceModal component:

```typescript
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
```
