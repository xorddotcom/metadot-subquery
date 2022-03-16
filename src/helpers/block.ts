import { Block as RuntimeBlock } from "@polkadot/types/interfaces/runtime";
import { Block } from "../types";

export const getBlockTimestamp = (block: RuntimeBlock): Date => {
  const extrinsicForSetTimestamp = block.extrinsics.find(item => {
    return item.method.method === "set" && item.method.section === "timestamp";
  });

  if (extrinsicForSetTimestamp) {
    return new Date(Number(extrinsicForSetTimestamp?.args?.[0].toString()));
  }

  return new Date();
};

export async function ensureBlock(id: string): Promise<void> {
  const block = await Block.get(id);

  if (!block) {
    await new Block(id).save();
  }
}
