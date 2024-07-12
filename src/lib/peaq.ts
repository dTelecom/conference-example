import type { Room } from "@prisma/client";

import { blake2AsHex, decodeAddress, sr25519PairFromSeed } from "@polkadot/util-crypto";
import { Keyring } from "@polkadot/keyring";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { hexToU8a, u8aConcat, u8aToU8a } from "@polkadot/util";
import { KeypairType } from "@polkadot/util-crypto/types";

interface ICreatePeaqRecord {
  slug: Room["slug"];
  identity: string;
}

export const createPeaqRecord = async ({
  slug,
  identity,
}: ICreatePeaqRecord, callback: () => void): Promise<void> => {
  const checkIfExists = await getStorageFromQuery(slug);
  // @ts-ignore
  const actionType = checkIfExists && !checkIfExists?.isStorageFallback ? null : "addItem";

  if (actionType) {
    await callStoragePallet(slug, { slug, identity }, actionType, callback);
  }
};

const callStoragePallet = async (itemType: string, value: {
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

    const hash = sendTransaction(extrinsic, keyPair, onChainNonce, callback);
    console.log("hash", hash);
    return hash;
  } catch (error) {
    console.error("Error storing data on chain", error);
  }
};

const sendTransaction = async (extrinsic: any, keyPair: any, nonce: any, callback: () => void) => {
  // @ts-ignore
  const hash = await extrinsic.signAndSend(keyPair, { nonce }, ({ events = [], status }) => {
    console.log("Transaction status:", status.type);
    callback();
    if (status.isInBlock) {
      console.log("Included at block hash", status.asInBlock.toHex());
      console.log("Events:");

      events.forEach(({ event: { data, method, section }, phase }) => {
        // @ts-ignore
        console.log("\t", phase.toString(), `: ${section}.${method}`, data.toString());
      });
    } else if (status.isFinalized) {
      console.log("Finalized block hash", status.asFinalized.toHex());
    }
  });
  return hash;
};

const createStorageKeys = (args: any) => {
  // console.log("args", args);
  // decode address to byte array
  const keysByteArray = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].type === 0) {
      const decoded_address = decodeAddress(args[i].value, false, 42);
      keysByteArray.push(decoded_address);
    }
    if (args[i].type === 1) {
      const hash_name = u8aToU8a(args[i].value);
      keysByteArray.push(hash_name);
    }
  }
  const key = u8aConcat(...keysByteArray);
  // encode the key using blake2b
  const hashed_key = blake2AsHex(key, 256);
  console.log("hashed_key", hashed_key);
  return { hashed_key };
};

const makePalletQuery = async (palletName: any, storeName: any, args: any) => {
  try {
    const api = await getNetworkApi();
    // @ts-ignore
    const data = await api.query[palletName][storeName](...args);
    // console.log("data---", data);
    api.disconnect();
    return data;
  } catch (error) {
    console.error(`Error ${makePalletQuery.name} - `, error);
    return error;
  }
};

const generateKeyPair = (type?: KeypairType) => {
  const keyring = new Keyring({ type: type || "sr25519" });
  const { publicKey, secretKey } = sr25519PairFromSeed(
    hexToU8a("0x" + process.env.API_SECRET)
  );

  return keyring.addFromPair({ publicKey, secretKey });
};

const getStorageFromQuery = async (itemType: string) => {
  const machineAddress = generateKeyPair().address;

  const { hashed_key } = createStorageKeys([
    { value: machineAddress, type: 0 },
    { value: itemType, type: 1 }
  ]);

  return await makePalletQuery("peaqStorage", "itemStore", [
    hashed_key
  ]);
};
const getNetworkApi = async () => {
  try {
    const api = new ApiPromise({
      provider: new WsProvider(process.env.PEAQ_WSS!)
    });
    await api.isReadyOrError;
    return api;
  } catch (error) {
    console.error("getNetworkApi error", error);
    throw error;
  }
};
