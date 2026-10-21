"use client";

import { useQuery } from "@tanstack/react-query";
import { Dialog, Button, Badge } from "@cloudflare/kumo";
import { fetchHealth, fetchConfig, fetchPolicyStatuses } from "@/lib/api";

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DiagnosticsModal({
  isOpen,
  onClose,
}: DiagnosticsModalProps) {
  const healthQuery = useQuery({
    queryKey: ["serviceHealth"],
    queryFn: fetchHealth,
    enabled: isOpen,
  });
  const configQuery = useQuery({
    queryKey: ["serviceConfig"],
    queryFn: fetchConfig,
    enabled: isOpen,
  });
  const statusesQuery = useQuery({
    queryKey: ["policyStatuses"],
    queryFn: fetchPolicyStatuses,
    enabled: isOpen,
  });

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog className="p-6 max-w-lg w-full space-y-4">
        <Dialog.Title>System Diagnostics & Service Info</Dialog.Title>
        <Dialog.Description>
          Live backend service metrics, endpoint configuration, and status
          metadata.
        </Dialog.Description>

        <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-1">
          {/* API Health */}
          <div className="border border-slate-200 rounded p-3 space-y-2">
            <div className="font-semibold text-slate-800 flex justify-between items-center">
              <span>API Health Check</span>
              {healthQuery.isSuccess && <Badge variant="success">Online</Badge>}
              {healthQuery.isError && (
                <Badge variant="destructive">Offline</Badge>
              )}
            </div>
            <pre className="bg-slate-100 p-2 rounded text-xs font-mono overflow-x-auto">
              {healthQuery.isLoading
                ? "Checking health..."
                : JSON.stringify(healthQuery.data, null, 2)}
            </pre>
          </div>

          {/* API Config */}
          <div className="border border-slate-200 rounded p-3 space-y-2">
            <div className="font-semibold text-slate-800">
              Environment & Config
            </div>
            <pre className="bg-slate-100 p-2 rounded text-xs font-mono max-h-32 overflow-auto">
              {configQuery.isLoading
                ? "Loading config..."
                : JSON.stringify(configQuery.data, null, 2)}
            </pre>
          </div>

          {/* Policy Status Metadata */}
          <div className="border border-slate-200 rounded p-3 space-y-2">
            <div className="font-semibold text-slate-800">
              Policy Statuses Metadata
            </div>
            <pre className="bg-slate-100 p-2 rounded text-xs font-mono max-h-32 overflow-auto">
              {statusesQuery.isLoading
                ? "Loading metadata..."
                : JSON.stringify(statusesQuery.data, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <a
            href={`${process.env.NEXT_PUBLIC_API_ORIGIN}/openapi.json`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-xs"
          >
            📄 View OpenAPI JSON
          </a>

          <Dialog.Close
            render={(props) => (
              <Button variant="secondary" onClick={onClose} {...props}>
                Close
              </Button>
            )}
          />
        </div>
      </Dialog>
    </Dialog.Root>
  );
}
