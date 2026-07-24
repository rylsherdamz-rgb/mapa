import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultScreen } from "../ResultScreen";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
}));

describe("ResultScreen", () => {
  const defaultProps = {
    distance: 500,
    score: 750_000,
    prize: 25_000_000,
    locationName: "Paris, France",
    onPlayAgain: vi.fn(),
    onClose: vi.fn(),
  };

  it("renders grade text", () => {
    render(<ResultScreen {...defaultProps} />);
    expect(screen.getByText("Great!")).toBeInTheDocument();
  });

  it("shows score percentage", () => {
    render(<ResultScreen {...defaultProps} />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("shows distance", () => {
    render(<ResultScreen {...defaultProps} />);
    expect(screen.getByText("500m")).toBeInTheDocument();
  });

  it("shows prize", () => {
    render(<ResultScreen {...defaultProps} />);
    expect(screen.getByText("25.0000 XLM")).toBeInTheDocument();
  });

  it("shows location name", () => {
    render(<ResultScreen {...defaultProps} />);
    expect(screen.getByText("Paris, France")).toBeInTheDocument();
  });

  it("shows Perfect! for near-perfect score", () => {
    render(<ResultScreen {...defaultProps} score={995_000} />);
    expect(screen.getByText("Perfect!")).toBeInTheDocument();
  });

  it("shows Good for mid-range score", () => {
    render(<ResultScreen {...defaultProps} score={450_000} />);
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it("shows Try Again for low score", () => {
    render(<ResultScreen {...defaultProps} score={100_000} />);
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("calls onPlayAgain when button clicked", async () => {
    const onPlayAgain = vi.fn();
    render(<ResultScreen {...defaultProps} onPlayAgain={onPlayAgain} />);
    await screen.getByText("Play Again").click();
    expect(onPlayAgain).toHaveBeenCalledOnce();
  });

  it("calls onClose when close button clicked", async () => {
    const onClose = vi.fn();
    const { container } = render(<ResultScreen {...defaultProps} onClose={onClose} />);
    const buttons = container.querySelectorAll("button");
    const closeBtn = buttons[0];
    expect(closeBtn).toBeInTheDocument();
    await closeBtn.click();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
