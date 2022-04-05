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
    value: bigint;
  };
  method: string;
  section: string;
}

interface Arg {
  name: string;
  type: Vec<CallType>;
  value: Value[];
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
  logger.info("args -->" + extrinsicRecord.args);

  for (let i = 0; i < args.length; i++) {
    if (args[i].name === "calls") {
      const values: Value[] = args[i].value;

      const method = "transfer";
      const section = "balances";

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

      for (let j = 0; j < values.length; j++) {
        const index: number = j;
        const value: Value = values[index];

        // check if transfer otherwise break
        if (!value.args.dest) break;
        logger.info("value --->" + JSON.stringify(value));

        const {
          args: {
            dest: { id: paramDestId },
            value: paramValue,
          },
          // method,
          // section,
        } = value;

        // create new call
        const callId = `${index}-${event.extrinsic.idx}`;
        logger.info("id --->" + callId);

        const call = new CallRecord(callId);
        call.index = index;
        call.module = section;
        call.name = method;
        call.paramDestId = paramDestId;
        call.paramValue = paramValue;

        // await ensureBatchRecord(batchRecordId);
        // call.batchRecordId = batchRecordId;
        await call.save();
      }
    }
  }
}
