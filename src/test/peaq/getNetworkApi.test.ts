import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { getNetworkApi } from "@/lib/peaq/getNetworkApi";

vi.mock("@polkadot/api", () => ({
  ApiPromise: vi.fn(),
  WsProvider: vi.fn()
}));

describe("getNetworkApi", () => {
  let mockApi: any;

  beforeEach(() => {
    mockApi = { isReadyOrError: Promise.resolve() };
    (ApiPromise as any).mockImplementation(() => mockApi);

    process.env.PEAQ_WSS = "wss://test-endpoint";
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.PEAQ_WSS;
  });

  it("successfully connects to the network and returns the API", async () => {
    const api = await getNetworkApi();
    expect(ApiPromise).toHaveBeenCalledWith({
      provider: expect.any(WsProvider)
    });
    expect(WsProvider).toHaveBeenCalledWith("wss://test-endpoint");
    expect(api).toBe(mockApi);
  });

  it("throws an error if the connection fails", async () => {
    (mockApi.isReadyOrError as any) = Promise.reject(new Error("Connection failed"));
    await expect(getNetworkApi()).rejects.toThrowError("Connection failed");
  });

  it("logs the error to the console if the connection fails", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error");
    (mockApi.isReadyOrError as any) = Promise.reject(new Error("Connection failed"));

    await expect(getNetworkApi()).rejects.toThrowError("Connection failed");
    expect(consoleErrorSpy).toHaveBeenCalledWith("getNetworkApi error", expect.any(Error));
  });

  it("throws an error if PEAQ_WSS environment variable is not set", async () => {
    delete process.env.PEAQ_WSS;
    await expect(getNetworkApi()).rejects.toThrowError();
  });
});
