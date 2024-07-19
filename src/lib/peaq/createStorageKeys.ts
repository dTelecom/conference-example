import { blake2AsHex, decodeAddress } from "@polkadot/util-crypto";
import { u8aConcat, u8aToU8a } from "@polkadot/util";

export const createStorageKeys = (args: any) => {
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

  return { hashed_key };
};
