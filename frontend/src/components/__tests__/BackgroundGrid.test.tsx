import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BackgroundGrid } from "../BackgroundGrid";

describe("BackgroundGrid", () => {
  it("renders with aria-hidden", () => {
    const { container } = render(<BackgroundGrid />);
    const root = container.firstElementChild;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveClass("terrain-field");
  });

  it("renders all terrain layers", () => {
    const { container } = render(<BackgroundGrid />);
    expect(container.querySelector(".terrain-field__base")).toBeInTheDocument();
    expect(container.querySelector(".terrain-field__grid")).toBeInTheDocument();
    expect(container.querySelector(".terrain-field__contours")).toBeInTheDocument();
    expect(container.querySelector(".terrain-field__halo--cyan")).toBeInTheDocument();
    expect(container.querySelector(".terrain-field__halo--violet")).toBeInTheDocument();
    expect(container.querySelector(".terrain-field__noise")).toBeInTheDocument();
  });
});
