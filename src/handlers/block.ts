import { SubstrateBlock } from "@subql/types";

import { getBlockTimestamp } from "../helpers/block";
import { Block } from "../types";

export async function ensureBlock(id: string): Promise<void> {
  const block = await Block.get(id);

  if (!block) {
    await new Block(id).save();
  }
}

export async function blockHandler(block: SubstrateBlock): Promise<void> {
  const hash = block.block.hash.toString();
  const number = block.block.header.number.toBigInt() || BigInt(0);
  const blockTimestamp = getBlockTimestamp(block.block);
  const parentHash = block.block.header.parentHash.toString();
  const specVersion = block.specVersion;

  const entity = new Block(hash);
  entity.number = number;
  entity.parentHash = parentHash;
  entity.specVersion = specVersion;
  entity.timestamp = blockTimestamp;
  await entity.save();
}
