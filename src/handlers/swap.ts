import { SubstrateEvent } from "@subql/types";

import { calculateFees } from "../helpers/fees";
import { getKVData } from "../helpers/getKVData";
import { SwapRecord } from "../types";
import { ensureAccount } from "./account";
import { ensureBlock } from "./block";

export async function ensureSwapRecord(id: string): Promise<SwapRecord> {
  const swapRecord = await SwapRecord.get(id);

  if (!swapRecord) {
    const sr = new SwapRecord(id);
    sr.save();
    return sr;
  } else {
    return swapRecord;
  }
}

export async function swapHandler(event: SubstrateEvent): Promise<void> {
  const kvData = getKVData(event.event.data);

  const accountId: string = kvData[0].value;
  const tokens: Record<string, string>[] = JSON.parse(kvData[1].value);
  const tokenNames: string[] = tokens.map((t: { token: string }) => {
    return t.token;
  });
  const amounts: string[] = JSON.parse(kvData[2].value);

  if (tokenNames.length !== amounts.length) return;

  const data = tokenNames.map((tokenName, i) => {
    return {
      token: tokenName ? tokenName : "",
      amount: amounts[i] ? amounts[i] : "",
    };
  });

  const blockNumber = event.block.block.header.number.toNumber();
  const blockId = event.block.block.hash.toString();
  const extrinsicHash = event.extrinsic?.extrinsic.hash.toString();
  const timestamp = event.block.timestamp;
  const isSuccess = event.extrinsic ? event.extrinsic.success : false;
  const fees = event.extrinsic ? calculateFees(event.extrinsic) : BigInt(0);

  // ensure block and account
  await ensureBlock(blockId);
  await ensureAccount(accountId);

  const swapRecord = new SwapRecord(`${blockNumber}-${extrinsicHash}`);
  swapRecord.extrinsicHash = extrinsicHash;
  swapRecord.fees = fees;
  swapRecord.timestamp = timestamp;
  swapRecord.status = isSuccess;
  swapRecord.blockId = blockId;
  swapRecord.fromId = accountId;
  swapRecord.data = data;

  await swapRecord.save();
}
