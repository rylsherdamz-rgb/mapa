import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { VercelAnalytics } from "../vercel-analytics";

vi.mock("@vercel/analytics/react", () => ({
  Analytics: () => <div data-testid="analytics" />,
}));

describe("VercelAnalytics", () => {
  it("renders analytics component", () => {
    const { getByTestId } = render(<VercelAnalytics />);
    expect(getByTestId("analytics")).toBeInTheDocument();
  });
});
