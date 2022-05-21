/* eslint-disable @typescript-eslint/no-explicit-any */
import { SubstrateEvent } from "@subql/types";

import { calculateFees } from "../helpers/fees";
import {
  ApproveRecord,
  ApproveStatus,
  Extrinsic,
  MultisigAccount,
  MultisigRecord,
  Transfer,
} from "../types";
import { ensureBlock } from "./block";

export async function ensureMultisigAccount(
  multisigAccountId: string,
  sender: string,
  extrinsicArgs: string
): Promise<void> {
  let entity = await MultisigAccount.get(multisigAccountId);
  if (entity === undefined) {
    entity = new MultisigAccount(multisigAccountId);
    const jsonExtrinsicArgs = JSON.parse(extrinsicArgs) as any[];
    let members: string[] = [];
    let threshold = 0;

    jsonExtrinsicArgs.forEach((arg) => {
      if (arg.name === "otherSignatories" || arg.name === "other_signatories") {
        members = [sender, ...arg.value];
      }
      if (arg.name === "threshold") {
        threshold = Number(arg.value);
      }
    });

    entity.members = members;
    entity.threshold = threshold;
    await entity.save();
  }
}

export async function saveApproveRecord(
  accountId: string,
  multisigAccountId: string,
  extrinsicIdx: string,
  callHash: string
): Promise<void> {
  const entity = new ApproveRecord(`${accountId}-${extrinsicIdx}`);
  entity.account = accountId;
  entity.multisigRecordId = `${multisigAccountId}-${extrinsicIdx}`;
  entity.callHash = callHash;
  await entity.save();
}

export async function newMultisigHandler(event: SubstrateEvent): Promise<void> {
  const blockId = event.block.block.hash.toString();
  await ensureBlock(blockId);
  const {
    event: { data },
  } = event;

  const blockNumber = event.block.block.header.number;
  const extrinsicIdx = `${blockNumber}-${event.extrinsic.idx}`;
  const accountId = data[0].toString();
  const multisigAccountId = data[1].toString();
  const callHash = data[2].toString();

  const extrinsicRecord = await Extrinsic.get(event.extrinsic?.extrinsic?.hash?.toString());
  await ensureMultisigAccount(multisigAccountId, accountId, extrinsicRecord.args);

  // Save new multisig record.
  const entity = new MultisigRecord(`${multisigAccountId}-${extrinsicIdx}`);
  entity.approvals = [accountId];
  entity.createExtrinsicIdx = extrinsicIdx;
  entity.module = event.event.section;
  entity.method = event.event.method;
  entity.timestamp = event.block.timestamp;
  entity.status = ApproveStatus.default;
  entity.blockId = blockId;
  entity.multisigAccountId = multisigAccountId;
  await entity.save();

  // Save approve record.
  await saveApproveRecord(accountId, multisigAccountId, extrinsicIdx, callHash);
}

export async function approveMultisigHandler(event: SubstrateEvent): Promise<void> {
  const blockId = event.block.block.hash.toString();
  await ensureBlock(blockId);

  const {
    event: { data },
  } = event;

  // Save approve record.
  const accountId = data[0].toString();
  const timepoint = data[1].toJSON() as any;
  const multisigAccountId = data[2].toString();
  const callHash = data[3].toString();
  const extrinsicIdx = `${timepoint.height}-${timepoint.index}`;

  const multisigRecord = await MultisigRecord.get(`${multisigAccountId}-${extrinsicIdx}`);
  if (!multisigRecord) return;

  await saveApproveRecord(accountId, multisigAccountId, extrinsicIdx, callHash);

  const approveRecords = await ApproveRecord.getByMultisigRecordId(
    `${multisigAccountId}-${extrinsicIdx}`
  );
  multisigRecord.approvals = approveRecords.map((approveRecord) => approveRecord.account);
  await multisigRecord.save();
}

export async function executedMultisigHandler(event: SubstrateEvent): Promise<void> {
  const currentBlockId = event.block.block.header.hash.toString();
  await ensureBlock(currentBlockId);

  const {
    event: { data },
  } = event;

  const accountId = data[0].toString();
  const timepoint = data[1].toJSON() as any;
  const multisigAccountId = data[2].toString();
  const callHash = data[3].toString();
  const timepointExtrinsicIdx = `${timepoint.height}-${timepoint.index}`;
  const multisigRecordId = `${multisigAccountId}-${timepointExtrinsicIdx}`;

  const multisigRecord = await MultisigRecord.get(`${multisigAccountId}-${timepointExtrinsicIdx}`);
  if (!multisigRecord) return;

  const extrinsicHash = event.extrinsic?.extrinsic.hash.toString();
  const blockNumber = event.block.block.header.number;

  if (!extrinsicHash) {
    logger.info("blockNumber >>> " + blockNumber);
    logger.info("extrinsicHash >>> " + extrinsicHash);
    return;
  }

  const transferId = `${event.block.block.header.number.toNumber()}-${extrinsicHash}`;
  const fees = event.extrinsic ? calculateFees(event.extrinsic) : BigInt(0);
  const approveRecords = await ApproveRecord.getByMultisigRecordId(multisigRecordId);

  // ensure tranfer entity exists before storing otherwise return
  const transfer = await Transfer.get(transferId);
  const transferPresent = transfer?.amount || transfer?.timestamp ? true : false;

  // return if transfer not present in multisig
  if (!transferPresent) return;

  // Save approve record.
  await saveApproveRecord(accountId, multisigAccountId, timepointExtrinsicIdx, callHash);

  // Update multisig record.
  multisigRecord.approvals = approveRecords.map((approveRecord) => approveRecord.account);
  multisigRecord.confirmExtrinsicIdx = `${blockNumber}-${event.extrinsic?.idx}`;
  multisigRecord.fees = fees;
  multisigRecord.status = ApproveStatus.confirmed;
  multisigRecord.confirmBlockId = currentBlockId;
  multisigRecord.transferId = transferId;
  await multisigRecord.save();
}

export async function cancelledMultisigHandler(event: SubstrateEvent): Promise<void> {
  await ensureBlock(event.block.block.header.hash.toString());

  const {
    event: { data },
  } = event;

  // Get multisig timepoint.
  const timepoint = data[1].toJSON() as any;
  const timepointExtrinsicIdx = `${timepoint.height}-${timepoint.index}`;
  const multisigAccountId = data[2].toString();

  const multisigRecord = await MultisigRecord.get(`${multisigAccountId}-${timepointExtrinsicIdx}`);
  if (!multisigRecord) return;

  // Update multisig record.
  const blockNumber = event.block.block.header.number;
  multisigRecord.cancelExtrinsicIdx = `${blockNumber}-${event.extrinsic?.idx}`;
  multisigRecord.status = ApproveStatus.cancelled;
  await multisigRecord.save();
}

export async function multisigHandler(event: SubstrateEvent): Promise<void> {
  const section = event.event.section;
  const method = event.event.method;

  if (section === "multisig") {
    if (method === "NewMultisig") {
      await newMultisigHandler(event);
    }

    if (method === "MultisigApproval") {
      await approveMultisigHandler(event);
    }

    if (method === "MultisigExecuted") {
      logger.info("executedMultisigHandler runing");
      await executedMultisigHandler(event);
    }

    if (method === "MultisigCancelled") {
      await cancelledMultisigHandler(event);
    }
  }
}
