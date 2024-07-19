import { ApiPromise, WsProvider } from "@polkadot/api";

export const getNetworkApi = async () => {
  if (!process.env.PEAQ_WSS) throw new Error("PEAQ_WSS environment variable is not set");

  try {
    const api = new ApiPromise({
      provider: new WsProvider(process.env.PEAQ_WSS)
    });
    await api.isReadyOrError;
    return api;
  } catch (error) {
    console.error("getNetworkApi error", error);
    throw error;
  }
};
