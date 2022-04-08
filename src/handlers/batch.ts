import { Vec } from "@polkadot/types";
import { Balance } from "@polkadot/types/interfaces";
import { Call as CallType } from "@polkadot/types/interfaces/runtime";
import { SubstrateEvent } from "@subql/types";

import { BatchRecord, BatchStatus, CallRecord, Extrinsic } from "../types";
import { ensureAccount } from "./account";
import { ensureBlock } from "./block";
import { ensureExtrinsic } from "./extrinsic";

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

export async function ensureBatchRecord(id: string): Promise<void> {
  const entity = await BatchRecord.get(id);

  if (!entity) {
    await new BatchRecord(id).save();
  }
}

export async function batchHandler(event: SubstrateEvent): Promise<void> {
  const blockId = event.block.block.hash.toString();
  const signer = event.extrinsic?.extrinsic.signer.toString();
  const extrinsicHash = event.extrinsic?.extrinsic?.hash?.toString();

  // ensure account, block, extrinsic
  await ensureBlock(blockId);
  await ensureAccount(signer);
  await ensureExtrinsic(extrinsicHash);

  const timestamp = event.block.timestamp;
  const blockNumber = event.block.block.header.number;
  const signature = event.extrinsic?.extrinsic.signature.toString();
  const extrinsicRecord = await Extrinsic.get(extrinsicHash);
  const args: Arg[] = JSON.parse(extrinsicRecord.args);
  // logger.info("args -->" + extrinsicRecord.args);
  // logger.info("extrinsicRecord.method >>> " + extrinsicRecord.method);
  // logger.info("extrinsicRecord.section >>> " + extrinsicRecord.section);

  if (extrinsicRecord.section !== "utility") return;

  if (args[0].name === "calls") {
    const values = args[0].value;
    let hasTransfer = false;
    let hasTransferCount = 0;
    for (let k = 0; k < values.length; k++) {
      const value = values[k];
      // check if transfer
      if (value?.args?.dest) {
        hasTransfer = true;
        hasTransferCount = hasTransferCount + 1;
      } else {
        hasTransfer = false;
      }
    }
    // logger.info("hasTransfer >>> " + hasTransfer);
    // logger.info("hasTransferCount >>> " + hasTransferCount);
    if (!hasTransfer || hasTransferCount === 0) return;
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i].name === "calls") {
      const values: Value[] = args[i].value;

      const method = "transfer";
      const section = "balances";
      // const method = args[i].method;
      // const section = args[i].section;

      // create batch
      const batchRecordId = `${blockNumber}-${extrinsicHash}`;
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

      batchRecord.senderId = signer;
      batchRecord.blockId = blockId;
      batchRecord.extrinsicsId = extrinsicHash;
      await batchRecord.save();

      const recordArr: string[] = [];

      // CallRecord
      for (let j = 0; j < values.length; j++) {
        const index: number = j;
        const value: Value = values[index];

        // check if transfer otherwise break
        if (!value.args.dest) break;
        // logger.info("value --->" + JSON.stringify(value));

        const {
          args: {
            dest: { id: paramDestId },
            value: paramValue,
          },
        } = value;

        // create new call
        const callId = `${index}-${event.extrinsic.idx}`;
        // logger.info("id --->" + callId);

        // logger.info("index >>> " + index);
        // logger.info("module >>> " + section);
        // logger.info("name >>> " + method);
        // logger.info("paramDestId >>> " + paramDestId);
        // logger.info("typeof paramValue >>> " + typeof paramValue);
        // logger.info("paramValue >>> " + paramValue);
        // logger.info("batchRecordId >>> " + batchRecordId);

        const call = new CallRecord(callId);
        call.index = index;
        call.module = section;
        call.name = method;
        call.paramDestId = paramDestId;
        call.paramValue = paramValue;

        await ensureBatchRecord(batchRecordId);
        call.batchId = batchRecordId;
        await call.save();

        recordArr.push(callId);
      }

      // logger.info("recordArr >>> " + JSON.stringify(recordArr));
      batchRecord.callsStringArray = recordArr;
      await batchRecord.save();
    }
  }
}
