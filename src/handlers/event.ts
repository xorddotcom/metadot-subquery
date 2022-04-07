import { EventRecord } from "@polkadot/types/interfaces";
import { SubstrateEvent } from "@subql/types";

import { Event } from "../types";
import { batchHandler } from "./batch";
import { ensureBlock } from "./block";
import { handleExtrinsic } from "./extrinsic";
import {
  approveMultisigHandler,
  cancelledMultisigHandler,
  executedMultisigHandler,
  newMultisigHandler,
} from "./multisig";
import { transferHandler } from "./transfer";

export async function eventHandler(
  event: SubstrateEvent
): Promise<{
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
      await (await handleExtrinsic(event.extrinsic)).save();
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
    // logger.info("section --->" + section)
    // logger.info("method --->"+ method)
    if (section === "utility" && method === "BatchCompleted") {
      // batchCompletedHandler
      await batchHandler(event);
    }
    if (section === "utility" && method === "BatchInterrupted") {
      // batchInterruptedHandler
      await batchHandler(event);
    }

    // MULTISIG
    if (section === "multisig" && method === "NewMultisig") {
      await newMultisigHandler(event);
    }
    if (section === "multisig" && method === "MultisigApproval") {
      await approveMultisigHandler(event);
    }
    if (section === "multisig" && method === "MultisigExecuted") {
      await executedMultisigHandler(event);
    }
    if (section === "multisig" && method === "MultisigCancelled") {
      await cancelledMultisigHandler(event);
    }

    // TRANSFER
    if (section === "balances" && method === "Transfer") {
      await transferHandler(event);
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
