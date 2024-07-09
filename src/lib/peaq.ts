import type { Room } from "@prisma/client";

import { sr25519PairFromSeed } from "@polkadot/util-crypto";
import { Keyring } from "@polkadot/keyring";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { hexToU8a } from "@polkadot/util";

export const createPeaqRecord = async (room: Room): Promise<void> => {
  const payloadHex = Buffer.from(JSON.stringify({ slug: room.slug })).toString(
    "hex"
  );

  const { publicKey, secretKey } = sr25519PairFromSeed(
    hexToU8a("0x" + process.env.API_SECRET)
  );

  const keyring = new Keyring({ type: "sr25519" });
  const kp = keyring.addFromPair({ publicKey, secretKey });

  const wsp = new WsProvider(process.env.PEAQ_WSS);
  const api = await (await ApiPromise.create({ provider: wsp })).isReady;

  if (!api.tx.peaqStorage?.addItem) {
    throw new Error("ts error: api.tx.peaqStorage.addItem is undefined");
  }

  const tx = await api.tx.peaqStorage
    .addItem(room.id, payloadHex)
    .signAndSend(kp, (result) => {
      console.log(`Transaction result: ${JSON.stringify(result)}\n\n`);
      tx();
    });
};
