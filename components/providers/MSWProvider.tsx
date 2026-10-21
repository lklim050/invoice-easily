// components/providers/MSWProvider.tsx
"use client";

import { useEffect, useState, useRef, ReactNode } from "react";

export function MSWProvider({ children }: { children: ReactNode }) {
  const [mswReady, setMswReady] = useState(false);
  const isInitializing = useRef(false);

  useEffect(() => {
    async function initMSW() {
      // Prevent double execution from React Strict Mode / hot-reloads
      if (typeof window !== "undefined" && !isInitializing.current) {
        isInitializing.current = true;
        const { worker } = await import("@/lib/mocks/browser");

        await worker.start({
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
        <p className="text-sm text-slate-500">
          Initializing Mock API environment...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
