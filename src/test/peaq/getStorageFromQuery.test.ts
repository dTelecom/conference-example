import { describe, expect, it, vi } from "vitest";
import { createStorageKeys } from "@/lib/peaq/createStorageKeys";
import { getStorageFromQuery } from "@/lib/peaq/getStorageFromQuery";
import { generateKeyPair } from "@/lib/peaq/generateKeyPair";
import { makePalletQuery } from "@/lib/peaq/makePalletQuery";

vi.mock("@/lib/peaq/createStorageKeys");
vi.mock("@/lib/peaq/makePalletQuery");
vi.mock("@/lib/peaq/generateKeyPair");

describe("getStorageFromQuery", () => {
  it("fetches storage data correctly", async () => {
    const mockMachineAddress = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
    const mockHashedKey = "0x1234567890abcdef";
    const mockStorageData = { some: "data" };

    // @ts-ignore
    vi.mocked(generateKeyPair).mockReturnValue({ address: mockMachineAddress });
    vi.mocked(createStorageKeys).mockReturnValue({ hashed_key: mockHashedKey });
    vi.mocked(makePalletQuery).mockResolvedValue(mockStorageData);

    const itemType = "itemType";
    const result = await getStorageFromQuery(itemType);

    expect(generateKeyPair).toHaveBeenCalled();
    expect(createStorageKeys).toHaveBeenCalledWith([
      { value: mockMachineAddress, type: 0 },
      { value: itemType, type: 1 }
    ]);
    expect(makePalletQuery).toHaveBeenCalledWith("peaqStorage", "itemStore", [mockHashedKey]);
    expect(result).toEqual(mockStorageData);
  });
});
