import { SubstrateBlock } from "@subql/types";

import { getBlockTimestamp } from "../helpers/block";
import { Block } from "../types";

export async function ensureBlock(id: string): Promise<void> {
  const block = await Block.get(id);

  if (!block) {
    await new Block(id).save();
  }
}

export async function blockHandler(block: SubstrateBlock): Promise<{
  hash: string;
  number: bigint;
  blockTimestamp: Date;
  parentHash: string;
  specVersion: number;
  save: () => Promise<void>;
}> {
  const hash = block.block.hash.toString();
  const number = block.block.header.number.toBigInt() || BigInt(0);
  const blockTimestamp = getBlockTimestamp(block.block);
  const parentHash = block.block.header.parentHash.toString();
  const specVersion = block.specVersion;

  const save = async (): Promise<void> => {
    const entity = new Block(hash);
    entity.number = number;
    entity.timestamp = blockTimestamp;
    entity.specVersion = specVersion;
    entity.parentHash = parentHash;
    await entity.save();
  };

  return {
    hash,
    number,
    blockTimestamp,
    parentHash,
    specVersion,
    save,
  };
}
