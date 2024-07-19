import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getStorageFromQuery } from "@/lib/peaq/getStorageFromQuery";
import { callStoragePallet } from "@/lib/peaq/callStoragePallet";
import { createPeaqRecord } from "@/lib/peaq/createPeaqRecord";

vi.mock("@polkadot/api", async () => { // Mock API interactions
  const actual = await vi.importActual("@polkadot/api"); // Import actual types
  return {
    ...actual,
    ApiPromise: vi.fn(),
    WsProvider: vi.fn()
  };
});

vi.mock("@/lib/peaq/getStorageFromQuery");

vi.mock("@/lib/peaq/callStoragePallet");

describe("createPeaqRecord", () => {
  let callback: () => void;

  beforeEach(() => {
    callback = vi.fn();
    vi.clearAllMocks();
    process.env.API_SECRET = "b6a3010d5b53ca75a4c9aa6d599e5af33a3a99111b48fd0579469842e9d6e1e5";
    process.env.PEAQ_WSS = "wss://wsspc1-qa.agung.peaq.network";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls callStoragePallet when item doesn't exist", async () => {
    vi.mocked(getStorageFromQuery).mockResolvedValueOnce(null);

    await createPeaqRecord({ slug: "test-room", identity: "0x1234" }, callback);

    expect(callStoragePallet).toHaveBeenCalledWith(
      "test-room",
      { slug: "test-room", identity: "0x1234" },
      "addItem",
      callback
    );
  });

  it("does not call callStoragePallet when item exists", async () => {
    vi.mocked(getStorageFromQuery).mockResolvedValueOnce({ isStorageFallback: false });

    await createPeaqRecord({ slug: "test-room", identity: "0x1234" }, callback);

    expect(callStoragePallet).not.toHaveBeenCalled();
  });
});
