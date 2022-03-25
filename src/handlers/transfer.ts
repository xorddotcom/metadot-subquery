import { SubstrateEvent } from "@subql/types";
import { Balance } from "@polkadot/types/interfaces";
import { SupportedTokens, TOKEN_INFO } from "../helpers/token";
import { Transfer } from "../types";
import { ensureAccount, updateTransferStatistic } from "./account";
import { ensureBlock } from "./block";
import { checkIfExtrinsicExecuteSuccess } from "../helpers/extrinsic";
import { ensureToken } from "./token";

export async function transferHandler(event: SubstrateEvent): Promise<void> {
  const name = TOKEN_INFO[SupportedTokens.POLKADOT].name;
  const decimals = TOKEN_INFO[SupportedTokens.POLKADOT].decimals.new;

  const data = event.event.data;
  const [from, to, amount] = JSON.parse(data.toString());

  const blockId = event.block.block.hash.toString();
  const blockNumber = event.block.block.header.number.toNumber();
  const expendedDecimals = BigInt("1" + "0".repeat(decimals));
  const transformedAmount = (amount as Balance).toBigInt();
  const extrinsicHash = event.extrinsic?.extrinsic.hash.toString();
  const timestamp = event.block.timestamp;
  const isSuccess = checkIfExtrinsicExecuteSuccess(event.extrinsic);

  // to
  await ensureAccount(to);
  await updateTransferStatistic(to);

  // from
  await ensureAccount(from);
  await updateTransferStatistic(from);

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
