import { KeypairType } from "@polkadot/util-crypto/types";
import { KeyringPair } from "@polkadot/keyring/types";
import { Keyring } from "@polkadot/keyring";
import { hexToU8a } from "@polkadot/util";
import { sr25519PairFromSeed } from "@polkadot/util-crypto";

export const generateKeyPair = (type?: KeypairType): KeyringPair => {
  const keyring = new Keyring({ type: type || "sr25519" });

  const pair = sr25519PairFromSeed(
    hexToU8a("0x" + process.env.API_SECRET)
  );

  if (!pair) {
    throw new Error("Error generating key pair");
  }
  return keyring.addFromPair(pair);
};


