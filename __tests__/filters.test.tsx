import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PolicyFilters from "@/components/PolicyFilters";

describe("PolicyFilters", () => {
  it("triggers onChange for different status options", () => {
    const handleChange = vi.fn();
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

    const dropdowns = screen.getAllByRole("combobox");

    const statusSelect = dropdowns[0];

    // Test "active"
    fireEvent.change(statusSelect, { target: { value: "active" } });
    expect(handleChange).toHaveBeenLastCalledWith("status", "active");

    // Test "draft"
    fireEvent.change(statusSelect, { target: { value: "draft" } });
    expect(handleChange).toHaveBeenLastCalledWith("status", "draft");

    // Test "cancelled"
    fireEvent.change(statusSelect, { target: { value: "cancelled" } });
    expect(handleChange).toHaveBeenLastCalledWith("status", "cancelled");
  });
});
