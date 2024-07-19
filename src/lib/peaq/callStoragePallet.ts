import { blake2AsHex } from "@polkadot/util-crypto";
import { generateKeyPair } from "@/lib/peaq/generateKeyPair";
import { getNetworkApi } from "@/lib/peaq/getNetworkApi";
import { sendTransaction } from "@/lib/peaq/sendTransaction";

export const callStoragePallet = async (itemType: string, value: {
  slug: string,
  identity: string,
}, action: "addItem" | "updateItem", callback: () => void) => {
  try {
    const api = await getNetworkApi();
    const keyPair = generateKeyPair();

    const onChainNonce = (
      await api.rpc.system.accountNextIndex(generateKeyPair().address)
    ).toBn();

    const payloadHash = blake2AsHex(Buffer.from(JSON.stringify(value)).toString(
      "hex"
    ));

    // @ts-ignore
    const extrinsic = api.tx.peaqStorage[action](itemType, payloadHash);

    return sendTransaction(extrinsic, keyPair, onChainNonce, callback);
  } catch (error) {
    console.error("Error storing data on chain", error);
  }
};
