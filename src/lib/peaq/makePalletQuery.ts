import { getNetworkApi } from "@/lib/peaq/getNetworkApi";

export const makePalletQuery = async (palletName: any, storeName: any, args: any) => {
  try {
    const api = await getNetworkApi();
    // @ts-ignore
    const data = await api.query[palletName][storeName](...args);
    api.disconnect();
    return data;
  } catch (error) {
    console.error(`Error ${makePalletQuery.name} - `, error);
    return error;
  }
};

