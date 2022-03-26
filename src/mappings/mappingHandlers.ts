import { SubstrateBlock, SubstrateEvent, SubstrateExtrinsic } from "@subql/types";

import { blockHandler } from "../handlers/block";
import { eventHandler } from "../handlers/event";
import { handleExtrinsic } from "../handlers/extrinsic";

export async function handleBlock(block: SubstrateBlock): Promise<void> {
  const handler = await blockHandler(block);
  await handler.save();
}

export async function handleEvent(event: SubstrateEvent): Promise<void> {
  const handler = await eventHandler(event);
  await handler.save();
}

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
  const handler = await handleExtrinsic(extrinsic);
  await handler.save();
}
