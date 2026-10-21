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
            retry: 3, // Auto retry due to the 503 error from the backend
            refetchOnWindowFocus: false, // Disable refetching on window focus
            staleTime: 60 * 1000, // Data is considered fresh for 1 minute
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
