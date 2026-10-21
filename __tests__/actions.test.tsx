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

  // Initial Render (Active state)
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

  // Action: Click Suspend
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

  // Verify: Sees "Pay Premium" button
  const payPremiumBtn = screen.getByRole("button", { name: /Pay Premium/i });
  expect(payPremiumBtn).toBeInTheDocument();

  // Action: Click "Pay Premium"
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

  // Verify: Back to the original 4 actions
  expect(
    screen.getByRole("button", { name: /File Claim/i }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Renew/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Suspend/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
});
