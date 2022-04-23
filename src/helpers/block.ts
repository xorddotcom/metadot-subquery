import { Block as RuntimeBlock } from "@polkadot/types/interfaces/runtime";

export const getBlockTimestamp = (block: RuntimeBlock): Date => {
  const extrinsicForSetTimestamp = block.extrinsics.find((item) => {
    return item.method.method === "set" && item.method.section === "timestamp";
  });

  if (extrinsicForSetTimestamp) {
    return new Date(Number(extrinsicForSetTimestamp?.args?.[0].toString()));
  }

  return new Date();
};
