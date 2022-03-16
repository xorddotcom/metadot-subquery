import { SubstrateEvent } from "@subql/types";
import { ensureBlock } from "../helpers/block";
import { ApproveRecord, ApproveStatus, Extrinsic, MultisigAccount, MultisigRecord } from "../types";

export async function ensureMultisigAccount(
  multisigAccountId: string,
  sender: string,
  extrinsicArgs: string
) {
  let entity = await MultisigAccount.get(multisigAccountId);
  if (entity === undefined) {
    entity = new MultisigAccount(multisigAccountId);
    const jsonExtrinsicArgs = JSON.parse(extrinsicArgs) as any[];
    let threshold = 0;
    let members: string[] = [];

    jsonExtrinsicArgs.forEach(arg => {
      if (arg.name === "threshold") {
        threshold = Number(arg.value);
      }

      if (arg.name === "otherSignatories" || arg.name === "other_signatories") {
        members = [sender, ...arg.value];
      }
    });

    entity.threshold = threshold;
    entity.members = members;

    await entity.save();
  }
}

export async function saveApproveRecord(
  accountId: string,
  multisigAccountId: string,
  extrinsicIdx: string,
  callHash: string
) {
  const entity = new ApproveRecord(`${accountId}-${extrinsicIdx}`);
  entity.account = accountId;
  entity.multisigRecordId = `${multisigAccountId}-${extrinsicIdx}`;
  entity.callHash = callHash;
  await entity.save();
}

export async function checkNewMultisig(event: SubstrateEvent) {
  await ensureBlock(event.block.block.header.hash.toString());
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
  entity.createExtrinsicIdx = extrinsicIdx;
  entity.module = event.event.section;
  entity.method = event.event.method;
  entity.multisigAccountId = multisigAccountId;
  entity.timestamp = event.block.timestamp;
  entity.blockId = event.block.block.header.hash.toString();
  entity.status = ApproveStatus.default;
  entity.approvals = [accountId];
  await entity.save();

  // Save approve record.
  await saveApproveRecord(accountId, multisigAccountId, extrinsicIdx, callHash);
}

export async function checkApproveMultisig(event: SubstrateEvent) {
  await ensureBlock(event.block.block.header.hash.toString());

  const {
    event: { data },
  } = event;

  // Save approve record.
  const accountId = data[0].toString();
  const timepoint = data[1].toJSON() as any;
  const multisigAccountId = data[2].toString();
  const callHash = data[3].toString();
  const extrinsicIdx = `${timepoint.height}-${timepoint.index}`;

  let multisigRecord = await MultisigRecord.get(`${multisigAccountId}-${extrinsicIdx}`);
  if (!multisigRecord) {
    return;
  }

  await saveApproveRecord(accountId, multisigAccountId, extrinsicIdx, callHash);

  const approveRecords = await ApproveRecord.getByMultisigRecordId(
    `${multisigAccountId}-${extrinsicIdx}`
  );
  multisigRecord.approvals = approveRecords.map(approveRecord => approveRecord.account);
  await multisigRecord.save();
}

export async function checkExecutedMultisig(event: SubstrateEvent) {
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

  let multisigRecord = await MultisigRecord.get(`${multisigAccountId}-${timepointExtrinsicIdx}`);
  if (!multisigRecord) {
    return;
  }

  // Save approve record.
  await saveApproveRecord(accountId, multisigAccountId, timepointExtrinsicIdx, callHash);

  // Update multisig record.
  const blockHeight = event.block.block.header.number;
  multisigRecord.status = ApproveStatus.confirmed;
  multisigRecord.confirmBlockId = currentBlockId;
  multisigRecord.confirmExtrinsicIdx = `${blockHeight}-${event.extrinsic?.idx}`;
  const approveRecords = await ApproveRecord.getByMultisigRecordId(multisigRecordId);
  multisigRecord.approvals = approveRecords.map(approveRecord => approveRecord.account);
  await multisigRecord.save();
}

export async function checkCancelledMultisig(event: SubstrateEvent) {
  await ensureBlock(event.block.block.header.hash.toString());

  const {
    event: { data },
  } = event;

  // Get multisig timepoint.
  const timepoint = data[1].toJSON() as any;
  const multisigAccountId = data[2].toString();

  const timepointExtrinsicIdx = `${timepoint.height}-${timepoint.index}`;

  let multisigRecord = await MultisigRecord.get(`${multisigAccountId}-${timepointExtrinsicIdx}`);
  if (!multisigRecord) {
    return;
  }

  // Update multisig record.
  const blockHeight = event.block.block.header.number;
  multisigRecord.status = ApproveStatus.cancelled;
  multisigRecord.cancelExtrinsicIdx = `${blockHeight}-${event.extrinsic?.idx}`;
  await multisigRecord.save();
}
