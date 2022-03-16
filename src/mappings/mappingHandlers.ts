import { SubstrateExtrinsic, SubstrateEvent, SubstrateBlock } from "@subql/types";
import { Block } from "../types";
import { getBlockTimestamp } from "../helpers/block";

import { createExtrinsic } from "../handlers/extrinsic";
import {
  checkApproveMultisig,
  checkCancelledMultisig,
  checkExecutedMultisig,
  checkNewMultisig,
} from "../handlers/multisig";

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
  await createExtrinsic(event.extrinsic);

  if (this.section === "multisig" && this.method === "NewMultisig") {
    await checkNewMultisig(event);
  }
  if (this.section === "multisig" && this.method === "MultisigApproval") {
    await checkApproveMultisig(event);
  }
  if (this.section === "multisig" && this.method === "MultisigExecuted") {
    await checkExecutedMultisig(event);
  }
  if (this.section === "multisig" && this.method === "MultisigCancelled") {
    await checkCancelledMultisig(event);
  }
}

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
  await createExtrinsic(extrinsic);
}
