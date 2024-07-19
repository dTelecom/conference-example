export const sendTransaction = async (extrinsic: any, keyPair: any, nonce: any, callback: () => void) => {
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
