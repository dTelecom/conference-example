import type { Room } from "@prisma/client";
import { getStorageFromQuery } from "@/lib/peaq/getStorageFromQuery";
import { callStoragePallet } from "@/lib/peaq/callStoragePallet";

interface ICreatePeaqRecord {
  slug: Room["slug"];
  identity: string;
}

export const createPeaqRecord = async ({
  slug,
  identity
}: ICreatePeaqRecord, callback: () => void): Promise<void> => {
  const checkIfExists = await getStorageFromQuery(slug);
  // @ts-ignore
  const actionType = checkIfExists && !checkIfExists?.isStorageFallback ? null : "addItem";

  if (actionType) {
    await callStoragePallet(slug, { slug, identity }, actionType, callback);
  }
};


