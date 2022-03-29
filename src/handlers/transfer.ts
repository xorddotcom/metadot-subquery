import { Balance } from "@polkadot/types/interfaces";
import { SubstrateEvent } from "@subql/types";

import { SupportedTokens, TOKEN_INFO } from "../helpers/token";
import { Transfer } from "../types";
import { ensureAccounts, updateTransferStatistics } from "./account";
import { ensureBlock } from "./block";
import { ensureToken } from "./token";

export async function transferHandler(event: SubstrateEvent): Promise<void> {
  const name = TOKEN_INFO[SupportedTokens.KUSAMA].name;
  const decimals = TOKEN_INFO[SupportedTokens.KUSAMA].decimals;

  const data = event.event.data;
  const from = data[0].toString();
  const to = data[1].toString();
  const amount = data[2];

  const blockId = event.block.block.hash.toString();
  const blockNumber = event.block.block.header.number.toNumber();
  const expendedDecimals = BigInt("1" + "0".repeat(decimals));
  const transformedAmount = (amount as Balance).toBigInt();
  const extrinsicHash = event.extrinsic?.extrinsic.hash.toString();
  const timestamp = event.block.timestamp;
  const isSuccess = event.extrinsic ? event.extrinsic.success : true;

  // to and from
  await ensureAccounts([to, from]);
  await updateTransferStatistics([to, from]);

  // set token details
  await ensureToken(name, expendedDecimals);

  // ensure block
  await ensureBlock(blockId);

  const entity = new Transfer(`${blockNumber}-${event.idx}`);
  entity.fromId = from;
  entity.toId = to;
  entity.tokenId = name;
  entity.amount = transformedAmount;
  entity.timestamp = timestamp;
  entity.extrinsicHash = extrinsicHash;
  entity.status = isSuccess;
  entity.blockId = blockId;

  await entity.save();
}
