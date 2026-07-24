import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WalletConnector } from "../WalletConnector";

const mockConnect = vi.fn();
const mockDisconnect = vi.fn();

vi.mock("../WalletProvider", () => ({
  useWallet: vi.fn(),
}));

import { useWallet } from "../WalletProvider";

describe("WalletConnector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows connect button when disconnected", () => {
    vi.mocked(useWallet).mockReturnValue({
      publicKey: null,
      isConnected: false,
      isConnecting: false,
      connect: mockConnect,
      disconnect: mockDisconnect,
    });

    render(<WalletConnector />);
    expect(screen.getByText("CONNECT")).toBeInTheDocument();
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("shows connecting state", () => {
    vi.mocked(useWallet).mockReturnValue({
      publicKey: null,
      isConnected: false,
      isConnecting: true,
      connect: mockConnect,
      disconnect: mockDisconnect,
    });

    render(<WalletConnector />);
    expect(screen.getByText("CONNECTING...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows connected state with truncated key", () => {
    vi.mocked(useWallet).mockReturnValue({
      publicKey: "GBHBOPW5AMW5J6RRR4YU2NLJI3HRX7SG4Q4ZZBJILLDR3644INLHMMZZ",
      isConnected: true,
      isConnecting: false,
      connect: mockConnect,
      disconnect: mockDisconnect,
    });

    render(<WalletConnector />);
    expect(screen.getByText("GBHB...MMZZ")).toBeInTheDocument();
    expect(screen.getByText("Exit")).toBeInTheDocument();
  });

  it("calls disconnect when exit is clicked", async () => {
    vi.mocked(useWallet).mockReturnValue({
      publicKey: "GABCDEF...1234",
      isConnected: true,
      isConnecting: false,
      connect: mockConnect,
      disconnect: mockDisconnect,
    });

    render(<WalletConnector />);
    await screen.getByText("Exit").click();
    expect(mockDisconnect).toHaveBeenCalledOnce();
  });
});
