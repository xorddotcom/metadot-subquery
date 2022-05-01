import { Vec } from "@polkadot/types";
import { Call as CallType } from "@polkadot/types/interfaces/runtime";
import { SubstrateEvent } from "@subql/types";

import {
  BatchRecord,
  BatchRecordReceiver,
  BatchRecordSender,
  BatchStatus,
  CallData,
  Extrinsic,
  Transfer,
} from "../types";
import { ensureAccount, ensureAccounts, updateBatchStatistic } from "./account";
import { ensureBlock } from "./block";
import { ensureExtrinsic } from "./extrinsic";
import { ensureToken } from "./token";

interface Value {
  args: {
    dest: {
      id: string;
    };
    value: string;
  };
}

interface Arg {
  name: string;
  type: Vec<CallType>;
  value: Value[];
  method: string;
  section: string;
}

const checkIfBatchTransfer = (values: Value[]): { hasTransfer: boolean; transferCount: number } => {
  let hasTransfer = false;
  let transferCount = 0;
  for (let k = 0; k < values.length; k++) {
    const value: Value = values[k];
    // check if transfer
    if (value?.args?.dest) {
      hasTransfer = true;
      transferCount = transferCount + 1;
    } else {
      hasTransfer = false;
    }
  }
  return { hasTransfer, transferCount };
};

export async function ensureBatchRecord(id: string): Promise<void> {
  const entity = await BatchRecord.get(id);

  if (!entity) {
    await new BatchRecord(id).save();
  }
}

export async function ensureBatchRecordReceiver(id: string): Promise<void> {
  const entity = await BatchRecordReceiver.get(id);

  if (!entity) {
    await new BatchRecordReceiver(id).save();
  }
}

export async function ensureBatchRecordSender(id: string): Promise<void> {
  const entity = await BatchRecordSender.get(id);

  if (!entity) {
    await new BatchRecordSender(id).save();
  }
}

export async function batchHandler(event: SubstrateEvent): Promise<void> {
  const blockId = event.block.block.hash.toString();
  const signer = event.extrinsic?.extrinsic.signer.toString();
  const extrinsicHash = event.extrinsic?.extrinsic?.hash?.toString();

  const timestamp = event.block.timestamp;
  const blockNumber = event.block.block.header.number.toNumber();
  const signature = event.extrinsic?.extrinsic.signature.toString();

  const { name, decimals } = ensureToken(blockNumber);

  const extrinsicRecord = await Extrinsic.get(extrinsicHash);
  const args: Arg[] = JSON.parse(extrinsicRecord.args);

  logger.info("args >>> " + JSON.stringify(args[0]));

  if (extrinsicRecord.section !== "utility") return;

  if (args[0].name === "calls" && (args[0].method === "batch" || args[0].method === "batchAll")) {
    const values: Value[] = args[0].value;
    const { hasTransfer, transferCount } = checkIfBatchTransfer(values);
    if (!hasTransfer || transferCount === 0) return;

    // if Transfer then proceed

    const method = "transfer";
    const section = "balances";
    const batchRecordId = `${blockNumber}-${extrinsicHash}`;

    // ensure connected entities
    await ensureBlock(blockId);
    await ensureAccount(signer);
    await updateBatchStatistic(signer);
    await ensureExtrinsic(extrinsicHash);

    // create BatchRecord
    const batchRecord = new BatchRecord(batchRecordId);
    batchRecord.extrinsicHash = extrinsicHash;
    batchRecord.module = section;
    batchRecord.method = method;
    batchRecord.timestamp = timestamp;
    batchRecord.signature = signature;

    // conditional for 'BatchCompleted' and 'BatchInterrupted'
    if (event.event.method === "BatchCompleted") {
      batchRecord.status = BatchStatus.completed;
      batchRecord.confirmExtrinsicIdx = `${blockNumber}-${event.extrinsic?.idx}`;
    }

    if (event.event.method === "BatchInterrupted") {
      batchRecord.status = BatchStatus.interrupted;
      batchRecord.cancelExtrinsicIdx = `${blockNumber}-${event.extrinsic?.idx}`;
    }

    batchRecord.blockId = blockId;
    await batchRecord.save();

    // get transfer event
    const transferId = `${blockNumber}-${extrinsicHash}`;
    const transfer = await Transfer.get(transferId);
    logger.info("tranfer token >>> " + JSON.stringify(transfer?.token));
    const token = transfer?.token ? transfer?.token : { name, decimals };
    logger.info("token >>> " + token);

    const callData: CallData[] = [];

    // create CallData
    for (let j = 0; j < values.length; j++) {
      const index: number = j;
      const value: Value = values[index];

      // check if transfer otherwise break
      if (!value.args.dest) break;

      const {
        args: {
          dest: { id: receiver },
          value: amount,
        },
      } = value;

      await ensureBlock(blockId);
      await ensureBatchRecord(batchRecordId);
      await ensureAccounts([receiver, signer]);

      // create batch record receiver entity
      const batchRecordReceiver = new BatchRecordReceiver(`${batchRecordId}-${receiver}`);
      batchRecordReceiver.receiverId = receiver;
      batchRecordReceiver.batchId = batchRecordId;
      await batchRecordReceiver.save();

      // create batch record receiver entity
      const batchRecordSender = new BatchRecordSender(`${batchRecordId}-${signer}`);
      batchRecordSender.senderId = signer;
      batchRecordSender.batchId = batchRecordId;
      await batchRecordSender.save();

      callData.push({
        amount: amount,
        timestamp: timestamp,
        receiver: receiver,
        sender: signer,
        token: token,
      });
    }

    batchRecord.calls = callData;
    await batchRecord.save();

    await Transfer.remove(transferId);
  }
}
