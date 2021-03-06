import { SubstrateEvent } from "@subql/types";

import { Event } from "../types";
import { batchHandler } from "./batch";
import { ensureBlock } from "./block";
import { handleExtrinsic } from "./extrinsic";
import { multisigHandler } from "./multisig";
import { transferHandler } from "./transfer";

export async function eventHandler(event: SubstrateEvent): Promise<void> {
  const index = event.idx;
  const blockNumber = event.block.block.header.number.toBigInt();
  const id = `${blockNumber}-${index}`;
  const blockId = event.block.block.hash.toString();
  const section = event.event.section;
  const method = event.event.method;
  const data = event.event.data.toString();
  const extrinsicHash =
    event?.extrinsic?.extrinsic?.hash?.toString() === "null"
      ? undefined
      : event?.extrinsic?.extrinsic?.hash?.toString();
  const timestamp = event.block.timestamp;

  await ensureBlock(blockId);

  const entity = new Event(id);
  if (extrinsicHash) {
    await handleExtrinsic(event.extrinsic);
    entity.extrinsicId = extrinsicHash;
  }
  entity.index = index;
  entity.section = section;
  entity.method = method;
  entity.data = data;
  entity.timestamp = timestamp;
  entity.blockId = blockId;
  await entity.save();

  // BATCH
  if (
    (section === "utility" && method === "BatchCompleted") ||
    (section === "utility" && method === "BatchInterrupted")
  ) {
    // batchCompletedHandler
    // batchInterruptedHandler
    await batchHandler(event);
  }

  // MULTISIG
  if (section === "multisig") await multisigHandler(event);

  // TRANSFER
  if (section === "balances" && method === "Transfer") {
    await transferHandler(event);
  }
}
