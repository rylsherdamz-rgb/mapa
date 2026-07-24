import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BackgroundGrid } from "../BackgroundGrid";

describe("BackgroundGrid", () => {
  it("renders with grid background", () => {
    const { container } = render(<BackgroundGrid />);
    const root = container.firstElementChild;
    expect(root).toHaveClass("fixed");
    expect(root).toHaveClass("-z-10");
  });

  it("renders all background layers", () => {
    const { container } = render(<BackgroundGrid />);
    expect(container.querySelector(".absolute.inset-0.bg-\\[\\#111417\\]")).toBeInTheDocument();
    expect(container.querySelector(".opacity-\\[0\\.04\\]")).toBeInTheDocument();
    expect(container.querySelector(".opacity-\\[0\\.03\\]")).toBeInTheDocument();
  });
});