import { Vec } from "@polkadot/types";
import { Call as CallType } from "@polkadot/types/interfaces/runtime";
import { SubstrateEvent } from "@subql/types";

import { getPolkadotDecimalsType, getTokenInfo, SupportedTokens } from "../constants/token";
import { BatchRecord, BatchStatus, CallRecord, Extrinsic, Transfer } from "../types";
import {
  ensureAccount,
  ensureAccounts,
  updateBatchStatistic,
  updateBatchToAccount,
} from "./account";
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

  const timestamp = event.block.timestamp;
  const blockNumber = event.block.block.header.number.toNumber();
  const signature = event.extrinsic?.extrinsic.signature.toString();

  const { name, decimals } = getTokenInfo(
    SupportedTokens.POLKADOT,
    getPolkadotDecimalsType(blockNumber)
  );
  const modifiedDecimals = BigInt("1" + "0".repeat(decimals));

  const extrinsicRecord = await Extrinsic.get(extrinsicHash);
  const args: Arg[] = JSON.parse(extrinsicRecord.args);

  if (extrinsicRecord.section !== "utility") return;

  if (args[0].name === "calls") {
    const values: Value[] = args[0].value;
    let hasTransfer = false;
    let hasTransferCount = 0;
    for (let k = 0; k < values.length; k++) {
      const value: Value = values[k];
      // check if transfer
      if (value?.args?.dest) {
        hasTransfer = true;
        hasTransferCount = hasTransferCount + 1;
      } else {
        hasTransfer = false;
      }
    }
    if (!hasTransfer || hasTransferCount === 0) return;

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

    batchRecord.sender = signer;
    batchRecord.blockId = blockId;
    // batchRecord.extrinsicsId = extrinsicHash;
    await batchRecord.save();

    const recordArr: string[] = [];
    const receivers: string[] = [];

    // create CallRecord
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

      // get transfer event
      const transferId = `${blockNumber}-${extrinsicHash}`;
      await Transfer.remove(transferId);
      // const transfer = await Transfer.get(transferId);
      // logger.info("transfer extrinsic hash >>> " + transfer.extrinsicHash);

      // create new call
      const callId = `${index}-${event.extrinsic.idx}`;

      await ensureBlock(blockId);
      await ensureBatchRecord(batchRecordId);
      await ensureAccounts([receiver, signer]);
      await ensureToken(name, modifiedDecimals);

      const call = new CallRecord(callId);
      call.amount = amount;
      call.extrinsicHash = extrinsicHash;
      // logger.info("call extrinsic hash >>> " + extrinsicHash);
      call.index = index;
      call.module = section;
      call.name = method;
      call.timestamp = timestamp;
      call.blockId = blockId;
      call.batchId = batchRecordId;
      call.receiverId = receiver;
      call.senderId = signer;
      call.tokenId = name;

      await call.save();

      recordArr.push(callId);
      receivers.push(receiver);
    }

    batchRecord.callsStringArray = recordArr;
    batchRecord.receivers = receivers;
    await batchRecord.save();
    await updateBatchToAccount(batchRecordId);
  }
}
