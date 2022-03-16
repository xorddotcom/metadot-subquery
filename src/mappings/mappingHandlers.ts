import { SubstrateExtrinsic, SubstrateEvent, SubstrateBlock } from "@subql/types";
import { Block } from "../types";
import { Balance } from "@polkadot/types/interfaces";
import { getBlockTimestamp } from "../helpers/block";

async function ensureBlock(id: string): Promise<void> {
  const block = await Block.get(id);

  if (!block) {
    await new Block(id).save();
  }
}

export async function handleBlock(block: SubstrateBlock): Promise<void> {
  const hash = block.block.hash.toString();
  const number = block.block.header.number.toBigInt() || BigInt(0);
  const blockTimestamp = getBlockTimestamp(block.block);
  const parentHash = block.block.header.parentHash.toString();
  const specVersion = block.specVersion;

  const entity = new Block(hash);
  entity.number = number;
  entity.timestamp = blockTimestamp;
  entity.specVersion = specVersion;
  entity.parentHash = parentHash;
  await entity.save();
}

export async function handleEvent(event: SubstrateEvent): Promise<void> {
  const {
    event: {
      data: [account, balance],
    },
  } = event;
  //Retrieve the record by its ID
  const record = await StarterEntity.get(event.block.block.header.hash.toString());
  record.field2 = account.toString();
  //Big integer type Balance of a transfer event
  record.field3 = (balance as Balance).toBigInt();
  await record.save();
}

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
  const record = await StarterEntity.get(extrinsic.block.block.header.hash.toString());
  //Date type timestamp
  record.field4 = extrinsic.block.timestamp;
  //Boolean tyep
  record.field5 = true;
  await record.save();
}
