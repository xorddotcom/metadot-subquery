import { EventRecord } from "@polkadot/types/interfaces";
import { SubstrateEvent } from "@subql/types";

import { Event } from "../types";
import { batchHandler } from "./batch";
import { ensureBlock } from "./block";
import { handleExtrinsic } from "./extrinsic";
import { multisigHandler } from "./multisig";
import { transferCurrencyHandler, transferHandler } from "./transfer";

export async function eventHandler(event: SubstrateEvent): Promise<{
  index: number;
  blockNumber: bigint;
  blockHash: string;
  events: EventRecord[];
  section: string;
  method: string;
  data: string;
  extrinsicHash: string | undefined;
  id: string;
  timestamp: Date;
  save: () => Promise<void>;
}> {
  const index = event.idx;
  const blockNumber = event.block.block.header.number.toBigInt();
  const id = `${blockNumber}-${index}`;
  const blockHash = event.block.block.hash.toString();
  const events = event.block.events;
  const section = event.event.section;
  const method = event.event.method;
  const data = event.event.data.toString();
  const extrinsicHash =
    event?.extrinsic?.extrinsic?.hash?.toString() === "null"
      ? undefined
      : event?.extrinsic?.extrinsic?.hash?.toString();
  const timestamp = event.block.timestamp;

  const save = async (): Promise<void> => {
    const entity = new Event(id);

    await ensureBlock(blockHash);
    if (extrinsicHash) {
      const handler = await handleExtrinsic(event.extrinsic);
      await handler.save();
      entity.extrinsicId = extrinsicHash;
    }

    entity.index = index;
    entity.section = section;
    entity.method = method;
    entity.data = data;
    entity.timestamp = timestamp;
    entity.blockId = blockHash;
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

    if (section === "currencies" && method === "Transferred") {
      await transferCurrencyHandler(event);
    }
  };

  return {
    index,
    blockNumber,
    blockHash,
    events,
    section,
    method,
    data,
    extrinsicHash,
    id,
    timestamp,
    save,
  };
}
