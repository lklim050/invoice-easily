// lib/mocks/handlers.ts

import { http, HttpResponse, delay } from "msw";
import { initialInvoices } from "./data";
import { Invoice, InvoiceStatus } from "@/types/invoice";

// create a variable for in-memory storage from mock data seeding
let invoicesDB: Invoice[] = [...initialInvoices];

export const handlers = [
  // GET ALL with endpoints GET /api/invoices
  http.get("/api/invoices", async ({ request }) => {
    await delay(400); // Simulate network latency

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");
    const searchQuery = url.searchParams.get("search")?.toLowerCase();

    let filtered = [...invoicesDB];

    if (statusFilter && statusFilter !== "ALL") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.clientName.toLowerCase().includes(searchQuery) ||
          invoice.id.toLowerCase().includes(searchQuery),
      );
    }
    return HttpResponse.json({ invoices: filtered });
  }),

  // GET BY ID, with endpoint GET /api/invoices/:id
  http.get("/api/invoices/:id", async ({ params }) => {
    await delay(300); //Simulate network latency
    const { id } = params;
    const invoice = invoicesDB.find((invoice) => invoice.id === id);
    if (!invoice) {
      return HttpResponse.json(
        { message: "Invoice not found" },
        { status: 404 },
      );
    }
    return HttpResponse.json(invoice);
  }),
  // CREATE, with endpoint POST /api/invoices
  http.post("/api/invoices", async ({ request }) => {
    await delay(500); // Simulate network latency
    const body = (await request.json()) as Omit<
      Invoice,
      "id" | "createdAt" | "updatedAt"
    >;

    const newInvoice = {
      ...body,
      id: `INV-2026-00${invoicesDB.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    invoicesDB.unshift(newInvoice);
    return HttpResponse.json(newInvoice, { status: 201 });
  }),

  // UPDATE INVOICE (Supports full updates & status-only updates)
  http.patch("/api/invoices/:id", async ({ params, request }) => {
    await delay(500); // Simulate network latency
    const { id } = params;
    const body = (await request.json()) as Partial<Invoice>;

    const index = invoicesDB.findIndex((invoice) => invoice.id === id);
    if (index === -1) {
      return HttpResponse.json(
        { message: "Invoice not found" },
        { status: 404 },
      );
    }

    // Spread the existing invoice, then override with any updated fields from body
    invoicesDB[index] = {
      ...invoicesDB[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(invoicesDB[index]);
  }),

  //DELETE by endpoint DELETE /api/invoices/:id
  http.delete("/api/invoices/:id", async ({ params }) => {
    await delay(300);
    const { id } = params;

    invoicesDB = invoicesDB.filter((invoice) => invoice.id !== id);
    return HttpResponse.json(null, { status: 204 });
  }),
];
