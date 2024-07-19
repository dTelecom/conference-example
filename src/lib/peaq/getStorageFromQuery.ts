import { createStorageKeys } from "@/lib/peaq/createStorageKeys";
import { generateKeyPair } from "@/lib/peaq/generateKeyPair";
import { makePalletQuery } from "@/lib/peaq/makePalletQuery";

export const getStorageFromQuery = async (itemType: string) => {
  const machineAddress = generateKeyPair().address;

  const keys = createStorageKeys([
    { value: machineAddress, type: 0 },
    { value: itemType, type: 1 }
  ]);

  return await makePalletQuery("peaqStorage", "itemStore", [
    keys.hashed_key
  ]);
};
