import { SubstrateEvent } from "@subql/types";
import { handleExtrinsic } from "./extrinsic";
import {
  checkApproveMultisig,
  checkCancelledMultisig,
  checkExecutedMultisig,
  checkNewMultisig,
} from "./multisig";
import { EventRecord } from "@polkadot/types/interfaces";

export async function eventHandler(
  event: SubstrateEvent
): Promise<{
  // index: number;
  // blockNumber: bigint;
  // blockHash: string;
  // events: EventRecord[];
  // section: string;
  // method: string;
  // data: string;
  // extrinsicHash: string | undefined;
  // id: string;
  // timestamp: Date;
  save: () => Promise<void>;
}> {
  const index = event.idx;
  const blockNumber = event.block.block.header.number.toBigInt();
  const blockHash = event.block.block.hash.toString();
  const events = event.block.events;
  const section = event.event.section;
  const method = event.event.method;
  const data = event.event.data.toString();
  const extrinsicHash =
    event?.extrinsic?.extrinsic?.hash?.toString() === "null"
      ? undefined
      : event?.extrinsic?.extrinsic?.hash?.toString();
  const id = `${blockNumber}-${index}`;
  const timestamp = event.block.timestamp;

  const save = async (): Promise<void> => {
    const handler = await handleExtrinsic(event.extrinsic);
    await handler.save();

    if (section === "multisig" && method === "NewMultisig") {
      await checkNewMultisig(event);
    }
    if (section === "multisig" && method === "MultisigApproval") {
      await checkApproveMultisig(event);
    }
    if (section === "multisig" && method === "MultisigExecuted") {
      await checkExecutedMultisig(event);
    }
    if (section === "multisig" && method === "MultisigCancelled") {
      await checkCancelledMultisig(event);
    }
  };

  return {
    // index,
    // blockNumber,
    // blockHash,
    // events,
    // section,
    // method,
    // data,
    // extrinsicHash,
    // id,
    // timestamp,
    save,
  };
}
