## Checklist: Insurance Policies Console

### Phase 1: Environment & Project Setup

- [ ] Initialize Next.js App Router project with TypeScript and Tailwind CSS (`npx create-next-app@latest policy-console --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`)[cite: 1]
- [ ] Install dependencies (`@cloudflare/kumo`, `@tanstack/react-query`, `@phosphor-icons/react`)[cite: 1]
- [ ] Install testing dependencies (`vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`)
- [ ] Configure `.env.local` and create `.env.example` with `NEXT_PUBLIC_API_ORIGIN=https://takehome-frontend-test-api.azurewebsites.net`[cite: 1]
- [ ] Set up `QueryProvider` for TanStack Query and import `@cloudflare/kumo` global styles in `layout.tsx`[cite: 1]
- [ ] Configure Vitest test runner (`vitest.config.ts` and `vitest.setup.ts`)
- [ ] Initialize local Git repository and commit baseline setup code[cite: 1]

---

### Phase 2: Core Data & API Client Layer

- [ ] Define TypeScript interfaces for API payloads (Policies, Metadata, Config, Error responses, Pagination)[cite: 1]
- [ ] Create centralized fetch client (`src/lib/api.ts`) using `NEXT_PUBLIC_API_ORIGIN`[cite: 1]
- [ ] Add `204 No Content` parsing guard for `DELETE` operations
- [ ] Implement exponential backoff retry logic for transient `503 MOCK_FAILURE` errors
- [ ] Add error parsing to extract `requestId`, error messages, and HTTP status codes

---

### Phase 3: Features & UI Implementation

#### 1. Policy List & Search (`/policies`)

- [ ] Build policy table/card layout using `@cloudflare/kumo`[cite: 1]
- [ ] Add list filters: status, policy type, customer ID, insurer, min/max premium, sort field, sort direction[cite: 1]
- [ ] Implement dedicated free-text search using `GET /api/v1/policies/search?q=...`[cite: 1]
- [ ] Synchronize all active filters, sorting, and pagination controls with URL search params[cite: 1]
- [ ] Display total results, current page, total pages, and next/prev pagination navigation[cite: 1]

#### 2. Policy Details & Form Operations (`/policies/[id]`, `/policies/new`)

- [ ] Build individual policy detail view displaying read-only and editable fields[cite: 1]
- [ ] Build creation form for new draft policies with client-side validation[cite: 1]
- [ ] Build editing form for draft and quoted policies[cite: 1]
- [ ] Implement confirmation modal/step for deleting draft and quoted policies[cite: 1]
- [ ] Respect server validation and read-only policy restrictions[cite: 1]

#### 3. Dynamic Lifecycle Engine

- [ ] Dynamically render action controls directly from each policy's `actions` array[cite: 1]
- [ ] Support actions: `quote`, `purchase`, `file_claim`, `renew`, `suspend`, `pay_premium`, `cancel`, `view_claim`, `withdraw_claim`[cite: 1]
- [ ] Wire actions to `POST /api/v1/policies/:id/actions/:action`[cite: 1]
- [ ] Invalidate/refetch policy state upon action success[cite: 1]

#### 4. Service Diagnostics & Metadata Panel (`/diagnostics`)

- [ ] Integrate metadata endpoints: `GET /api/v1/policy-statuses` and `GET /api/v1/config`[cite: 1]
- [ ] Integrate service endpoints: `GET /`, `GET /health`, and `GET /openapi.json`[cite: 1]
- [ ] Display status descriptions, configuration values, and OpenAPI spec link/info[cite: 1]

---

### Phase 4: Reliability, UX & Error Handling

- [ ] Implement clear loading spinners, empty states, and success indicators for all async operations[cite: 1]
- [ ] Display actionable error banners with accessible `requestId`s for HTTP `400`, `404`, `409`, and `503`[cite: 1]
- [ ] Provide retry paths for failed requests and prevent duplicate form submissions during in-flight requests[cite: 1]
- [ ] Preserve form inputs, filters, and page context when network requests fail[cite: 1]
- [ ] Ensure mobile responsiveness across narrow viewports and touch devices (tables, forms, cards, dialogs)[cite: 1]

---

### Phase 5: Testing & Final Submission

- [ ] Write unit tests for search and filtering controls[cite: 1]
- [ ] Write unit tests for form validation and submit logic[cite: 1]
- [ ] Write unit tests for lifecycle action state updates[cite: 1]
- [ ] Write unit tests for error catching and retry behavior[cite: 1]
- [ ] Push local Git commits to a private GitHub repository[cite: 1]
- [ ] Create detailed documentation on Notion (setup instructions, trade-offs, architecture notes, video demo link)[cite: 1]
- [ ] Invite `quanyou@impetusfintech.com.sg` to private GitHub repo and Notion workspace[cite: 1]

## Phase 1: Environment & Project Setup

### 1. Initialize Next.js Project

- Initialize a new Next.js project with TypeScript and Tailwind CSS:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**notes:**

- this would create gitignore, package.json, tsconfig.json, tailwind.config.js, and other boilerplate files.

### 2. Install Dependencies and Packages

- Ensure you are in the project directory and install the required dependencies:

```bash
# Core Application Dependencies
npm install @cloudflare/kumo @tanstack/react-query @phosphor-icons/react

# Testing Dependencies
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

**notes:**

- if dep install error, do `npm install -D @types/node@latest` to resolve typescript node types issue.

### 3. Configure Environment Variables

- Create a `.env.local` file in the root of the project and add the following environment variable:

```
NEXT_PUBLIC_API_ORIGIN=https://takehome-frontend-test-api.azurewebsites.net
```

### 4. Configure QueryProvider and Global Styles

- Create a client provider wrapper at src/components/providers/QueryProvider.tsx:

```tsx
"use client"; // explicitly marked as Client Component
// because tanstack is client-based vs next.js server based

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2, // Auto-retry transient 503 errors up to 2 times
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60, // 1 minute cache validity
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

- Import the `QueryProvider` in `src/app/layout.tsx` and wrap the application:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import QueryProvider from "@/components/providers/QueryProvider";
import "@cloudflare/kumo/styles";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Insurance Policy Console",
  description: "Policy management console",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

**Notes:**

- The `@cloudflare/kumo/styles` import is necessary to include Kumo UI's global styles. You can also import the Tailwind CSS styles in `globals.css`:

```css
@source "../node_modules/@cloudflare/kumo/dist/**/*.{js,jsx,ts,tsx}";
@import "@cloudflare/kumo/styles/tailwind";
@import "tailwindcss";
```

### 5. Configure Vitest Test Runner

- Create a `vitest.config.ts` file in the root of the project:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- Create a `vitest.setup.ts` file in the root of the project:

```ts
import "@testing-library/jest-dom/vitest";
```

- Update `package.json` to include the test script:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest"
}
```

### 6. Initialize Git Repository

- Initialize a new Git repository and make the initial commit:

```bash
git init
git add .
git commit -m "chore: initial project setup with Next.js, Kumo UI, TanStack Query, and Vitest"
```

### 7. Verify Project Setup

- Dev Server Check: Run npm run dev and ensure http://localhost:3000 loads the Next.js welcome page.

```bash
npm run dev
```

## Phase 2: Core Data & API Client Layer

### GET API (Test with TanStack Query and JSON stringify rendering)

- Define Interfaces and Types at /types/policy.ts:

```ts
// after check API via Bruno

export interface Policy {
  id: string;
  policyNumber: string;
  customerId: string;
  customerName: string;
  policyType: string;
  insurer: string;
  status: string;
  premiumAmount: number;
  premiumFrequency: string;
  coverageAmount: number;
  deductibleAmount: number;
  currency: string;
  effectiveDate: string;
  expirationDate: string;
  agentName: string | null;
  notes: string | null;
  claimReference: string | null;
  createdAt: string;
  updatedAt: string;
  actions: string[];
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PolicyListResponse {
  data: Policy[];
  pagination: Pagination;
  filters: Record<string, unknown>;
}

export interface ApiErrorResponse {
  error: {
    code: string; // e.g. "MOCK_FAILURE" or "INVALID_STATE"
    message: string;
    requestId: string;
  };
}
```

- Define API Client at /lib/api.ts:

```ts
// lib/api.ts
import { PolicyListResponse, ApiErrorResponse } from "../types/policy";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function readPolicies(): Promise<PolicyListResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/policies`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      error: {
        code: "UNKNOWN_ERROR",
        message: "An unexpected error occurred",
        requestId: "",
      },
    }));

    throw new Error(
      errorData.error.message ||
        `Request failed with status ${response.status}`,
    );
  }

  return response.json();
}
```

- Define in /app/page.tsx with the tanstack query to fetch policies and display them in a list or table format.

```tsx
// app/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { readPolicies } from "../lib/api";

export default function HomePage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["policies"],
    queryFn: readPolicies,
  });

  if (isLoading)
    return (
      <div className="p-8">
        Loading policies... (retrying automatically if 503 occurs)
      </div>
    );
  if (isError)
    return (
      <div className="p-8 text-red-500">Error: {(error as Error).message}</div>
    );

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Verification Test</h1>
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-[600px] text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}
```

### GET API with pagination and params

- Update lib/api.ts so it accepts parameter arguments:

```ts
// lib/api.ts
import { PolicyListResponse, ApiErrorResponse } from "../types/policy";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface FetchPoliciesParams {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}

export async function fetchPolicies(
  params: FetchPoliciesParams = {},
): Promise<PolicyListResponse> {
  const url = new URL("/api/v1/policies", API_BASE_URL);

  if (params.page) url.searchParams.set("page", params.page.toString());
  if (params.pageSize)
    url.searchParams.set("pageSize", params.pageSize.toString());
  if (params.status && params.status !== "all")
    url.searchParams.set("status", params.status);
  if (params.search) url.searchParams.set("search", params.search);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      error: {
        code: "UNKNOWN_ERROR",
        message: "An unexpected error occurred",
        requestId: "",
      },
    }));

    throw new Error(
      errorData.error.message ||
        `Request failed with status ${response.status}`,
    );
  }

  return response.json();
}
```

- Update app/page.tsx to use the new fetchPolicies with params:

```tsx
// app/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPolicies } from "../lib/api";

export default function HomePage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["policies", { page, status }],
    queryFn: () => fetchPolicies({ page, pageSize: 10, status }),
  });

  if (isLoading) return <div className="p-8">Loading policies...</div>;
  if (isError)
    return (
      <div className="p-8 text-red-500">Error: {(error as Error).message}</div>
    );

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Policy List Verification</h1>
      {/* Simple Controls to test params */}
      <div className="flex gap-4 items-center">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={!data?.pagination.hasPreviousPage}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous Page
        </button>
        <span>
          Page {data?.pagination.page} of {data?.pagination.totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={!data?.pagination.hasNextPage}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next Page
        </button>
      </div>
      // using pre tag to preserve whitespace and formatting for JSON output
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-[500px] text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}
```

### Building Component: Policy Table

- Create a reusable component to display policies in a table format:

```ts
// components/PolicyTable.tsx
"use client";

import { Table, Badge, Button } from "@cloudflare/kumo";
import { Policy, Pagination } from "../types/policy";

interface PolicyTableProps {
  policies: Policy[];
  pagination: Pagination;
  onPageChange: (newPage: number) => void;
}

export default function PolicyTable({
  policies,
  pagination,
  onPageChange,
}: PolicyTableProps) {
  if (policies.length === 0) {
    return <div className="p-8 text-center text-slate-500">No policies found.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Kumo Table Structure */}
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Policy Number</Table.Head>
            <Table.Head>Customer</Table.Head>
            <Table.Head>Type</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Premium</Table.Head>
            <Table.Head>Coverage</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {policies.map((policy) => (
            <Table.Row key={policy.id}>
              <Table.Cell className="font-mono text-xs font-semibold">
                {policy.policyNumber}
              </Table.Cell>
              <Table.Cell>{policy.customerName}</Table.Cell>
              <Table.Cell className="capitalize">{policy.policyType}</Table.Cell>
              <Table.Cell>
                <Badge variant={policy.status === "active" ? "success" : "neutral"}>
                  {policy.status}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                ${policy.premiumAmount.toLocaleString()} {policy.currency}
              </Table.Cell>
              <Table.Cell>
                ${policy.coverageAmount.toLocaleString()} {policy.currency}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      {/* Pagination Bar using Kumo Buttons */}
      <div className="flex items-center justify-between border-t pt-4">
        <span className="text-sm text-slate-600">
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
        </span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={!pagination.hasPreviousPage}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={!pagination.hasNextPage}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- At page.tsx, replace the `<pre>` block with the `PolicyTable` component:

```tsx
// app/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPolicies } from "../lib/api";
import PolicyTable from "../components/PolicyTable";

export default function HomePage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["policies", { page }],
    queryFn: () => fetchPolicies({ page, pageSize: 10 }),
  });

  if (isLoading) return <div className="p-8">Loading policies...</div>;
  if (isError)
    return (
      <div className="p-8 text-red-500">Error: {(error as Error).message}</div>
    );

  return (
    <main className="p-8 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">
        Insurance Operations Console
      </h1>

      {data && (
        <PolicyTable
          policies={data.data}
          pagination={data.pagination}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </main>
  );
}
```

### Add Policy Filters to page.tsx

- Add the filter dropdown directly above the table:

```tsx
// app/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { readPolicies } from "@/lib/api";
import PolicyTable from "@/components/PolicyTable";

export default function HomePage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");

  const { data, isLoading, isError, error } = useQuery({
    // 1. Include both page and status in the queryKey
    queryKey: ["policies", { page, status }],
    // 2. Pass status parameter to the fetcher
    queryFn: () => readPolicies({ page, pageSize: 10, status }),
  });

  if (isLoading) return <div className="p-8">Loading policies...</div>;
  if (isError)
    return (
      <div className="p-8 text-red-500">Error: {(error as Error).message}</div>
    );

  return (
    <main className="p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Insurance Operations Console
        </h1>

        {/* Status Filter Control */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="status-filter"
            className="text-sm font-medium text-slate-700"
          >
            Filter Status:
          </label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1); // Reset to page 1 whenever filter changes!
            }}
            className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="quoted">Quoted</option>
            <option value="claim_in_review">Claim In Review</option>
          </select>
        </div>
      </div>

      {data && (
        <PolicyTable
          policies={data.data}
          pagination={data.pagination}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </main>
  );
}
```

### Add search input to page.tsx

- Integrate search input to filter policies by policy number or customer name:

```tsx
// app/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { readPolicies } from "@/lib/api";
import PolicyTable from "@/components/PolicyTable";

export default function HomePage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // add debounce effect to avoid excessive API calls on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, isError, error } = useQuery({
    // Include page, status, and search in the queryKey!
    queryKey: ["policies", { page, status, search: debouncedSearch }],
    queryFn: () =>
      readPolicies({ page, pageSize: 10, status, search: debouncedSearch }),
    placeholderData: keepPreviousData, // keep previous data while fetching new data for better UX
  });

  if (isLoading) return <div className="p-8">Loading policies...</div>;
  if (isError)
    return (
      <div className="p-8 text-red-500">Error: {(error as Error).message}</div>
    );

  return (
    <main className="p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">
          Insurance Operations Console
        </h1>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Search Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search policy or customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to page 1 on search change
              }}
              className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="status-filter"
              className="text-sm font-medium text-slate-700"
            >
              Status:
            </label>
            <select
              id="status-filter"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1); // Reset to page 1 on status change
              }}
              className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="quoted">Quoted</option>
              <option value="claim_in_review">Claim In Review</option>
            </select>
          </div>
        </div>
      </div>

      {data && (
        <PolicyTable
          policies={data.data}
          pagination={data.pagination}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </main>
  );
}
```

## Phase 3: Status Action Mutations

### Add Update function

- Add Update function to lib/api.ts to handle policy actions:

```ts
// lib/api.ts
export interface UpdatePolicyPayload {
  premiumAmount?: number;
  coverageAmount?: number;
  notes?: string;
}

export async function updatePolicy(
  id: string,
  payload: UpdatePolicyPayload,
): Promise<Policy> {
  const url = new URL(`/api/v1/policies/${id}`, API_URL);

  const response = await fetch(url.toString(), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message ||
        `Failed to update policy (${response.status})`,
    );
  }

  return response.json();
}
```

- Create UpdatePolicyModal component to handle policy updates with a modal form. This component will allow users to edit the premium amount, coverage amount, and notes for a specific policy.

```tsx
// components/UpdatePolicyModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, Button } from "@cloudflare/kumo";
import { Policy } from "../types/policy";

interface UpdatePolicyModalProps {
  policy: Policy | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    id: string,
    updates: { premiumAmount: number; coverageAmount: number; notes: string },
  ) => void;
  isPending: boolean;
  errorMessage?: string | null;
}

export default function UpdatePolicyModal({
  policy,
  isOpen,
  onClose,
  onSubmit,
  isPending,
  errorMessage,
}: UpdatePolicyModalProps) {
  const [premiumAmount, setPremiumAmount] = useState<number>(
    policy?.premiumAmount ?? 0,
  );
  const [coverageAmount, setCoverageAmount] = useState<number>(
    policy?.coverageAmount ?? 0,
  );
  const [notes, setNotes] = useState<string>(policy?.notes ?? "");
  useEffect(() => {
    if (policy) {
      setPremiumAmount(policy.premiumAmount);
      setCoverageAmount(policy.coverageAmount);
      setNotes(policy.notes || "");
    }
  }, [policy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(policy!.id, { premiumAmount, coverageAmount, notes });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog className="p-6" size="base">
        <Dialog.Title className="text-lg font-bold mb-4">
          Update Policy: {policy?.policyNumber}
        </Dialog.Title>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs bg-red-50 text-red-600 rounded border border-red-200">
              {errorMessage}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">
              Premium Amount ($)
            </label>
            <input
              type="number"
              value={premiumAmount}
              onChange={(e) => setPremiumAmount(Number(e.target.value))}
              className="border p-1 text-sm w-full rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Coverage Amount ($)
            </label>
            <input
              type="number"
              value={coverageAmount}
              onChange={(e) => setCoverageAmount(Number(e.target.value))}
              className="border p-1 text-sm w-full rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border p-1 text-sm w-full rounded"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Dialog.Close
              render={(props) => (
                <Button
                  {...props}
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              )}
            />
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>
    </Dialog.Root>
  );
}
```

- Update the PolicyTable component to include an "Edit" button for each policy row, which will open the UpdatePolicyModal when clicked.

```tsx
// components/PolicyTable.tsx
"use client";

import { Table, Badge, Button } from "@cloudflare/kumo";
import { Policy, Pagination } from "../types/policy";

interface PolicyTableProps {
  policies: Policy[];
  pagination: Pagination;
  onPageChange: (newPage: number) => void;
  onUpdate: (policy: Policy) => void;
}

export default function PolicyTable({
  policies,
  pagination,
  onPageChange,
  onUpdate,
}: PolicyTableProps) {
  if (policies.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">No policies found.</div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Policy Number</Table.Head>
            <Table.Head>Customer</Table.Head>
            <Table.Head>Type</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Premium</Table.Head>
            <Table.Head>Coverage</Table.Head>
            <Table.Head>Actions</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {policies.map((policy) => (
            <Table.Row key={policy.id}>
              <Table.Cell className="font-mono text-xs font-semibold">
                {policy.policyNumber}
              </Table.Cell>
              <Table.Cell>{policy.customerName}</Table.Cell>
              <Table.Cell>{policy.policyType}</Table.Cell>
              <Table.Cell>
                <Badge>{policy.status.replace(/_/g, " ")}</Badge>
              </Table.Cell>
              <Table.Cell>
                ${policy.premiumAmount} {policy.currency}
              </Table.Cell>
              <Table.Cell>
                ${policy.coverageAmount} {policy.currency}
              </Table.Cell>
              <Table.Cell>
                {/* Render Edit button if "edit" is supported for this policy */}
                {policy.actions?.includes("edit") && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onUpdate(policy)}
                  >
                    Edit
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <div className="flex items-center justify-between pt-4 border-t">
        <span className="text-sm text-slate-600">
          Page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
          total)
        </span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={!pagination.hasPreviousPage}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={!pagination.hasNextPage}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- Integrate and wire useMutation to page.tsx

```tsx
// app/page.tsx
"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { readPolicies, updatePolicy } from "../lib/api";
import { useState, useEffect } from "react";
import PolicyTable from "../components/PolicyTable";
import { Policy } from "../types/policy";
import UpdatePolicyModal from "@/components/UpdatePolicyModal";

export default function HomePage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // READ QUERY
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["policies", { page, status, search: debouncedSearch }],
    queryFn: () =>
      readPolicies({ page, pageSize: 10, status, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  // UPDATE MUTATION
  const { mutate: handleUpdateSubmit, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Parameters<typeof updatePolicy>[1];
    }) => updatePolicy(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      setIsUpdateModalOpen(false);
      setSelectedPolicy(null);
      setUpdateError(null);
    },
    onError: (err: Error) => {
      setUpdateError(`Failed to update, please click "Save Changes" again`); // 👈 Keep modal open and set error message
    },
  });

  if (isLoading) return <div className="p-8">Loading policies...</div>;
  if (isError)
    return (
      <div className="p-8 text-red-500">Error: {(error as Error).message}</div>
    );

  return (
    <main className="p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">
          Insurance Operations Console
        </h1>

        {/* Search Bar */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search policy or customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to page 1 on search change
              }}
              className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px]"
            />
          </div>

          {/* Status Filter Control */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="status-filter"
              className="text-sm font-medium text-slate-700"
            >
              Filter Status:
            </label>
            <select
              id="status-filter"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1); // Reset to page 1 whenever filter changes!
              }}
              className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="quoted">Quoted</option>
              <option value="claim_in_review">Claim In Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Policy Table*/}
      {data && (
        <PolicyTable
          policies={data.data}
          pagination={data.pagination}
          onPageChange={(newPage) => setPage(newPage)}
          onUpdate={(policy) => {
            setSelectedPolicy(policy);
            setIsUpdateModalOpen(true);
          }}
        />
      )}
      <UpdatePolicyModal
        isOpen={isUpdateModalOpen}
        policy={selectedPolicy}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedPolicy(null);
        }}
        onSubmit={(id, updates) => handleUpdateSubmit({ id, updates })}
        isPending={isUpdating}
        errorMessage={updateError}
      />
    </main>
  );
}
```

### Add Delete function

- Add Delete function to lib/api.ts to handle policy deletion:

```ts
export async function deletePolicy(id: string): Promise<void> {
  const url = new URL(`/api/v1/policies/${id}`, API_URL);

  const response = await fetch(url.toString(), {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Delete failed (${response.status})`,
    );
  }
}
```

- Create DeletePolicyModal component to confirm deletion of a policy:

```tsx
// components/DeletePolicyModal.tsx
"use client";

import { Dialog, Button } from "@cloudflare/kumo";
import { Policy } from "../types/policy";

interface DeletePolicyModalProps {
  policy: Policy | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isPending: boolean;
  errorMessage?: string | null;
}

export default function DeletePolicyModal({
  policy,
  isOpen,
  onClose,
  onConfirm,
  isPending,
  errorMessage,
}: DeletePolicyModalProps) {
  if (!policy) return null;

  return (
    <Dialog.Root
      role="alertdialog"
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <Dialog className="p-6" size="sm">
        <Dialog.Title className="text-lg font-bold text-red-600 mb-2">
          Delete Policy
        </Dialog.Title>

        <Dialog.Description className="text-sm text-slate-600 mb-4">
          Are you sure you want to delete policy{" "}
          <strong className="font-mono">{policy.policyNumber}</strong>? This
          action cannot be undone.
        </Dialog.Description>

        {errorMessage && (
          <div className="p-3 mb-4 text-xs bg-red-50 text-red-600 rounded border border-red-200">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Dialog.Close
            render={(props) => (
              <Button
                {...props}
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
            )}
          />
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(policy.id)}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Dialog>
    </Dialog.Root>
  );
}
```

- Update PolicyTable to include delete button and handle delete action.

```tsx
// components/PolicyTable.tsx
"use client";

import { Table, Badge, Button } from "@cloudflare/kumo";
import { Policy, Pagination } from "../types/policy";

interface PolicyTableProps {
  policies: Policy[];
  pagination: Pagination;
  onPageChange: (newPage: number) => void;
  onUpdate: (policy: Policy) => void;
  onDelete: (policy: Policy) => void; // 👈 Added onDelete prop
}

export default function PolicyTable({
  policies,
  pagination,
  onPageChange,
  onUpdate,
  onDelete,
}: PolicyTableProps) {
  if (policies.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">No policies found.</div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Policy Number</Table.Head>
            <Table.Head>Customer</Table.Head>
            <Table.Head>Type</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Premium</Table.Head>
            <Table.Head>Coverage</Table.Head>
            <Table.Head>Actions</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {policies.map((policy) => (
            <Table.Row key={policy.id}>
              <Table.Cell className="font-mono text-xs font-semibold">
                {policy.policyNumber}
              </Table.Cell>
              <Table.Cell>{policy.customerName}</Table.Cell>
              <Table.Cell>{policy.policyType}</Table.Cell>
              <Table.Cell>
                <Badge>{policy.status.replace(/_/g, " ")}</Badge>
              </Table.Cell>
              <Table.Cell>
                ${policy.premiumAmount} {policy.currency}
              </Table.Cell>
              <Table.Cell>
                ${policy.coverageAmount} {policy.currency}
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  {policy.actions?.includes("edit") && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onUpdate(policy)}
                    >
                      Edit
                    </Button>
                  )}

                  {/* Render Delete button if allowed by server actions array */}
                  {policy.actions?.includes("delete") && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(policy)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <div className="flex items-center justify-between pt-4 border-t">
        <span className="text-sm text-slate-600">
          Page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
          total)
        </span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={!pagination.hasPreviousPage}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={!pagination.hasNextPage}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- Wire useMutation for delete in page.tsx and integrate DeletePolicyModal:

```tsx
// app/page.tsx
"use client";

import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { readPolicies, updatePolicy, deletePolicy } from "@/lib/api";
import PolicyTable from "@/components/PolicyTable";
import UpdatePolicyModal from "@/components/UpdatePolicyModal";
import DeletePolicyModal from "@/components/DeletePolicyModal";
import { Policy } from "@/types/policy";

export default function HomePage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");

  // Edit Modal State
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Delete Modal State
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Read Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["policies", { page, status }],
    queryFn: () => readPolicies({ page, pageSize: 10, status }),
    placeholderData: keepPreviousData,
  });

  // Update Mutation
  const { mutate: handleUpdateSubmit, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Parameters<typeof updatePolicy>[1];
    }) => updatePolicy(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      setIsUpdateModalOpen(false);
      setSelectedPolicy(null);
      setUpdateError(null);
    },
    onError: (err: Error) => setUpdateError(err.message),
  });

  // Delete Mutation
  const { mutate: handleDeleteConfirm, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deletePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      setIsDeleteModalOpen(false);
      setPolicyToDelete(null);
      setDeleteError(null);
    },
    onError: (err: Error) => setDeleteError(err.message),
  });

  if (isLoading) return <div className="p-8">Loading policies...</div>;
  if (isError)
    return (
      <div className="p-8 text-red-500">Error: {(error as Error).message}</div>
    );

  return (
    <main className="p-8 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">
        Insurance Operations Console
      </h1>

      {data && (
        <PolicyTable
          policies={data.data}
          pagination={data.pagination}
          onPageChange={setPage}
          onUpdate={(policy) => {
            setSelectedPolicy(policy);
            setIsUpdateModalOpen(true);
            setUpdateError(null);
          }}
          onDelete={(policy) => {
            setPolicyToDelete(policy);
            setIsDeleteModalOpen(true);
            setDeleteError(null);
          }}
        />
      )}

      {/* Edit Modal */}
      <UpdatePolicyModal
        policy={selectedPolicy}
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedPolicy(null);
        }}
        onSubmit={(id, updates) => handleUpdateSubmit({ id, updates })}
        isPending={isUpdating}
        errorMessage={updateError}
      />

      {/* Delete Modal */}
      <DeletePolicyModal
        policy={policyToDelete}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPolicyToDelete(null);
        }}
        onConfirm={(id) => handleDeleteConfirm(id)}
        isPending={isDeleting}
        errorMessage={deleteError}
      />
    </main>
  );
}
```

### Add Create function

- Add Create function to lib/api.ts to handle policy creation:

```ts
// lib/api.ts
export interface CreatePolicyPayload {
  customerName: string;
  policyType: "Auto" | "Home" | "Life" | "Travel";
  premiumAmount: number;
  coverageAmount: number;
  notes?: string;
}

export async function createPolicy(
  payload: CreatePolicyPayload,
): Promise<Policy> {
  const url = new URL("/api/v1/policies", API_URL);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Creation failed (${response.status})`,
    );
  }

  return response.json();
}
```

2. Create CreatePolicyModal component to handle policy creation with a modal form:

```tsx
// components/CreatePolicyModal.tsx
"use client";

import { useState } from "react";
import { Dialog, Button } from "@cloudflare/kumo";
import { CreatePolicyPayload } from "../lib/api";

interface CreatePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreatePolicyPayload) => void;
  isPending: boolean;
  errorMessage?: string | null;
}

export default function CreatePolicyModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  errorMessage,
}: CreatePolicyModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [policyType, setPolicyType] =
    useState<CreatePolicyPayload["policyType"]>("Auto");
  const [premiumAmount, setPremiumAmount] = useState<number>(100);
  const [coverageAmount, setCoverageAmount] = useState<number>(10000);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      customerName,
      policyType,
      premiumAmount,
      coverageAmount,
      notes,
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog className="p-6" size="base">
        <Dialog.Title className="text-lg font-bold mb-4">
          Create New Policy
        </Dialog.Title>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs bg-red-50 text-red-600 rounded border border-red-200">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="border p-1 text-sm w-full rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Policy Type
            </label>
            <select
              value={policyType}
              onChange={(e) =>
                setPolicyType(
                  e.target.value as CreatePolicyPayload["policyType"],
                )
              }
              className="border p-1 text-sm w-full rounded bg-white"
            >
              <option value="Auto">Auto</option>
              <option value="Home">Home</option>
              <option value="Life">Life</option>
              <option value="Travel">Travel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Premium Amount ($)
            </label>
            <input
              type="number"
              value={premiumAmount}
              onChange={(e) => setPremiumAmount(Number(e.target.value))}
              className="border p-1 text-sm w-full rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Coverage Amount ($)
            </label>
            <input
              type="number"
              value={coverageAmount}
              onChange={(e) => setCoverageAmount(Number(e.target.value))}
              className="border p-1 text-sm w-full rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border p-1 text-sm w-full rounded"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Dialog.Close
              render={(props) => (
                <Button
                  {...props}
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              )}
            />
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? "Creating..." : "Create Policy"}
            </Button>
          </div>
        </form>
      </Dialog>
    </Dialog.Root>
  );
}
```

- Wire up the create mutation in page.tsx and integrate CreatePolicyModal:

```tsx
// app/page.tsx addition
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
const [createError, setCreateError] = useState<string | null>(null);

const { mutate: handleCreateSubmit, isPending: isCreating } = useMutation({
  mutationFn: (payload: CreatePolicyPayload) => createPolicy(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["policies"] });
    setIsCreateModalOpen(false);
    setCreateError(null);
  },
  onError: (err: Error) => setCreateError(err.message),
});

// At the tsx return section, add the CreatePolicyModal component:
{
  /* 👇 CREATE POLICY BUTTON */
}
<Button
  variant="primary"
  onClick={() => {
    setCreateError(null);
    setIsCreateModalOpen(true);
  }}
>
  + Create Policy
</Button>;

{
  /* Create Policy Modal */
}
<CreatePolicyModal
  isOpen={isCreateModalOpen}
  onClose={() => {
    setIsCreateModalOpen(false);
    setCreateError(null);
  }}
  onSubmit={(payload) => handleCreateSubmit(payload)}
  isPending={isCreating}
  errorMessage={createError}
/>;
```

### Lifecycle of a Policy

- Add triggerPolicyAction function to lib/api.ts to handle policy lifecycle actions:

```ts
// lib/api.ts
export async function triggerPolicyAction(
  id: string,
  action: string,
): Promise<Policy> {
  // Construct the exact path: /api/v1/policies/{id}/actions/{action}
  const url = new URL(`/api/v1/policies/${id}/actions/${action}`, API_URL);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message ||
        `Action '${action}' failed (${response.status})`,
    );
  }

  return response.json();
}
```

- Add Life Cycle Action buttons to PolicyTable component:

```tsx
// components/PolicyTable.tsx
"use client";

import { Table, Badge, Button } from "@cloudflare/kumo";
import { Policy, Pagination } from "../types/policy";

interface PolicyTableProps {
  policies: Policy[];
  pagination: Pagination;
  onPageChange: (newPage: number) => void;
  onUpdate: (policy: Policy) => void;
  onDelete: (policy: Policy) => void;
  onAction: (policy: Policy, action: string) => void; // 👈 Add action handler
  pendingActionId?: string | null;
}

export default function PolicyTable({
  policies,
  pagination,
  onPageChange,
  onUpdate,
  onDelete,
  onAction,
  pendingActionId,
}: PolicyTableProps) {
  if (policies.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">No policies found.</div>
    );
  }

  // Helper to standardise lifecycle action button labels
  const getActionLabel = (action: string) => {
    switch (action) {
      case "issue":
        return "Issue";
      case "cancel":
        return "Cancel";
      case "quote":
        return "Re-Quote";
      default:
        return action.charAt(0).toUpperCase() + action.slice(1);
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Policy Number</Table.Head>
            <Table.Head>Customer</Table.Head>
            <Table.Head>Type</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Premium</Table.Head>
            <Table.Head>Coverage</Table.Head>
            <Table.Head>Actions</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {policies.map((policy) => {
            // Filter out CRUD operations to leave only state transition actions
            const lifecycleActions = (policy.actions || []).filter(
              (act) => act !== "edit" && act !== "delete",
            );

            return (
              <Table.Row key={policy.id}>
                <Table.Cell className="font-mono text-xs font-semibold">
                  {policy.policyNumber}
                </Table.Cell>
                <Table.Cell>{policy.customerName}</Table.Cell>
                <Table.Cell>{policy.policyType}</Table.Cell>
                <Table.Cell>
                  <Badge>{policy.status.replace(/_/g, " ")}</Badge>
                </Table.Cell>
                <Table.Cell>
                  ${policy.premiumAmount} {policy.currency}
                </Table.Cell>
                <Table.Cell>
                  ${policy.coverageAmount} {policy.currency}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {/* Render Edit Button */}
                    {policy.actions?.includes("edit") && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onUpdate(policy)}
                      >
                        Edit
                      </Button>
                    )}

                    {/* Dynamically Render HATEOAS Lifecycle Action Buttons */}
                    {lifecycleActions.map((action) => (
                      <Button
                        key={action}
                        size="sm"
                        variant={
                          action === "cancel" ? "destructive" : "primary"
                        }
                        disabled={pendingActionId === `${policy.id}-${action}`}
                        onClick={() => onAction(policy, action)}
                      >
                        {pendingActionId === `${policy.id}-${action}`
                          ? "Processing..."
                          : getActionLabel(action)}
                      </Button>
                    ))}

                    {/* Render Delete Button */}
                    {policy.actions?.includes("delete") && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(policy)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>

      <div className="flex items-center justify-between pt-4 border-t">
        <span className="text-sm text-slate-600">
          Page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
          total)
        </span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={!pagination.hasPreviousPage}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={!pagination.hasNextPage}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- Wire up the lifecycle action mutation in page.tsx and handle the onAction callback:

```tsx
// app/page.tsx (Lifecycle action handling addition)
const [actionError, setActionError] = useState<string | null>(null);
const [pendingActionId, setPendingActionId] = useState<string | null>(null);

const { mutate: handleLifecycleAction } = useMutation({
  mutationFn: ({ id, action }: { id: string; action: string }) =>
    triggerPolicyAction(id, action),
  onMutate: ({ id, action }) => {
    setPendingActionId(`${id}-${action}`);
    setActionError(null);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["policies"] });
    setPendingActionId(null);
  },
  onError: (err: Error) => {
    setPendingActionId(null);
    if (err.message.includes("MOCK_FAILURE") || err.message.includes("503")) {
      setActionError(
        "A temporary server issue occurred. Please retry the action.",
      );
    } else {
      setActionError(`Action failed: ${err.message}`);
    }
  },
});

// At the tsx return section, render error message on top of the table if actionError exists
{
  actionError && (
    <div className="p-3 text-xs bg-red-50 text-red-600 rounded border border-red-200 flex justify-between items-center">
      <span>{actionError}</span>
      <button
        onClick={() => setActionError(null)}
        className="font-bold underline text-xs"
      >
        Dismiss
      </button>
    </div>
  );
}

// pass handler to PolicyTable
<PolicyTable
  policies={data.data}
  pagination={data.pagination}
  onPageChange={setPage}
  onUpdate={(policy) => {
    setSelectedPolicy(policy);
    setIsUpdateModalOpen(true);
  }}
  onDelete={(policy) => {
    setPolicyToDelete(policy);
    setIsDeleteModalOpen(true);
  }}
  onAction={(policy, action) =>
    handleLifecycleAction({ id: policy.id, action })
  }
  pendingActionId={pendingActionId}
/>;
```

## Phase 4: Vitest

- Rehash on setup and install

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event
```

- Add vitest config to vitest.config.ts

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

- Add vitest setup file vitest.setup.ts

```ts
// vitest.setup.ts
import "@testing-library/jest-dom";
```

- Update package.json scripts to include vitest commands:

```json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run"
}
```

- Create "**tests**"/actions.test.tsx to test Lifecycle Actions:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PolicyTable from "@/components/PolicyTable";

describe("Lifecycle Actions", () => {
  it("renders lifecycle action buttons and triggers click", () => {
    const handleAction = vi.fn();
    const mockPolicy = {
      id: "123",
      policyNumber: "POL-001",
      customerName: "John Doe",
      policyType: "auto",
      insurer: "Harbor",
      status: "draft",
      premiumAmount: 100,
      currency: "USD",
      coverageAmount: 1000,
      effectiveDate: "2026-01-01",
      expirationDate: "2027-01-01",
      actions: ["file_claim", "renew", "suspend", "cancel"],
    };

    render(
      <PolicyTable
        policies={[mockPolicy]}
        pagination={{
          page: 1,
          pageSize: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }}
        onPageChange={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        onAction={handleAction}
      />,
    );

    const renewBtn = screen.getByRole("button", { name: /Renew/i });
    fireEvent.click(renewBtn);
    expect(handleAction).toHaveBeenCalledWith(mockPolicy, "renew");
  });
});
```

- Create "**tests**"/h/filters.test.tsx to test PolicyFilters component. Note below test is only for dropdown selection, you can add more tests for other filters and reset button as needed.:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PolicyFilters from "@/components/PolicyFilters";

describe("PolicyFilters", () => {
  it("triggers onChange when status option is selected", () => {
    // dummy function to track onChange calls
    const handleChange = vi.fn();
    // Render the PolicyFilters component with initial filters and the onChange handler
    render(
      <PolicyFilters
        filters={{
          status: "all",
          q: "",
          policyType: "",
          insurer: "",
          customerId: "",
          minPremium: "",
          maxPremium: "",
          sortBy: "createdAt",
          sortOrder: "desc",
          pageSize: 10,
        }}
        onChange={handleChange}
        onReset={vi.fn()}
      />,
    );

    // Searches the virtual DOM for all <select> elements on the page.
    const dropdowns = screen.getAllByRole("combobox");

    // Status is the 1st select dropdown rendered (index 0)
    const statusSelect = dropdowns[0];

    // Simulates a real user clicking the dropdown and selecting the "Active" option.
    fireEvent.change(statusSelect, { target: { value: "active" } });

    // Verifies that the handleChange function was called with the correct arguments when the status option is changed.
    expect(handleChange).toHaveBeenCalledWith("status", "active");

    // Test "draft"
    fireEvent.change(statusSelect, { target: { value: "draft" } });
    expect(handleChange).toHaveBeenLastCalledWith("status", "draft");

    // Test "cancelled"
    fireEvent.change(statusSelect, { target: { value: "cancelled" } });
    expect(handleChange).toHaveBeenLastCalledWith("status", "cancelled");
  });
});
```

- Below is another sample test for lifecycle actions, you can add more tests for other actions as needed:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, test } from "vitest";
import userEvent from "@testing-library/user-event";
import PolicyTable from "@/components/PolicyTable";

const mockPolicyFixture = {
  id: "pol_28fe3e0114",
  policyNumber: "HOME-2026-5777",
  customerId: "customer_demo",
  customerName: "Demo Customer",
  policyType: "home",
  insurer: "Harbor Mutual",
  status: "active",
  premiumAmount: 1250,
  premiumFrequency: "annual",
  coverageAmount: 400000,
  deductibleAmount: 1000,
  currency: "USD",
  effectiveDate: "2026-05-01",
  expirationDate: "2027-05-01",
  agentName: "Morgan Lee",
  notes: "New homeowners quote.",
  claimReference: "CLM-2026-8971",
  createdAt: "2026-09-10T16:39:32.239Z",
  updatedAt: "2026-09-10T17:28:49.395Z",
  actions: ["file_claim", "renew", "suspend", "cancel"],
};

const defaultPagination = {
  page: 1,
  pageSize: 10,
  total: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

describe("Lifecycle Actions", () => {
  it("renders lifecycle action buttons and triggers click", () => {
    const handleAction = vi.fn();

    render(
      <PolicyTable
        policies={[mockPolicyFixture]}
        pagination={defaultPagination}
        onPageChange={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        onAction={handleAction}
      />,
    );

    const renewBtn = screen.getByRole("button", { name: /Renew/i });
    fireEvent.click(renewBtn);
    expect(handleAction).toHaveBeenCalledWith(mockPolicyFixture, "renew");
  });
});

// 1. Single Action Test (Renew Button)
test("renders active policy actions and handles renew click", async () => {
  const user = userEvent.setup();
  const handleAction = vi.fn();

  render(
    <PolicyTable
      policies={[mockPolicyFixture]}
      pagination={defaultPagination}
      onPageChange={vi.fn()}
      onUpdate={vi.fn()}
      onDelete={vi.fn()}
      onAction={handleAction}
    />,
  );

  const renewBtn = screen.getByRole("button", { name: /Renew/i });
  expect(renewBtn).toBeInTheDocument();

  await user.click(renewBtn);
  expect(handleAction).toHaveBeenCalledWith(mockPolicyFixture, "renew");
});

// 2. Full Lifecycle Test (Suspend -> Pay Premium -> Active)
test("emulates full policy lifecycle: suspend -> pay premium -> back to active", async () => {
  const user = userEvent.setup();
  const handleAction = vi.fn();

  // 1. Initial Render (Active state)
  const { rerender } = render(
    <PolicyTable
      policies={[mockPolicyFixture]}
      pagination={defaultPagination}
      onPageChange={vi.fn()}
      onUpdate={vi.fn()}
      onDelete={vi.fn()}
      onAction={handleAction}
    />,
  );

  // Verify initial 4 action buttons are present
  expect(
    screen.getByRole("button", { name: /File Claim/i }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Renew/i })).toBeInTheDocument();
  const suspendBtn = screen.getByRole("button", { name: /Suspend/i });
  expect(suspendBtn).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();

  // 2. Action: Click Suspend
  await user.click(suspendBtn);

  // Re-render component with suspended status and updated action list
  const suspendedPolicy = {
    ...mockPolicyFixture,
    status: "suspended",
    actions: ["pay_premium"],
  };

  rerender(
    <PolicyTable
      policies={[suspendedPolicy]}
      pagination={defaultPagination}
      onPageChange={vi.fn()}
      onUpdate={vi.fn()}
      onDelete={vi.fn()}
      onAction={handleAction}
    />,
  );

  // 3. Verify: Sees "Pay Premium" button
  const payPremiumBtn = screen.getByRole("button", { name: /Pay Premium/i });
  expect(payPremiumBtn).toBeInTheDocument();

  // 4. Action: Click "Pay Premium"
  await user.click(payPremiumBtn);

  // Re-render component back to active state
  rerender(
    <PolicyTable
      policies={[mockPolicyFixture]}
      pagination={defaultPagination}
      onPageChange={vi.fn()}
      onUpdate={vi.fn()}
      onDelete={vi.fn()}
      onAction={handleAction}
    />,
  );

  // 5. Verify: Back to the original 4 actions
  expect(
    screen.getByRole("button", { name: /File Claim/i }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Renew/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Suspend/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
});
```
