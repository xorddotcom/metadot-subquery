import { SubstrateBlock, SubstrateEvent } from "@subql/types";

import { blockHandler } from "../handlers/block";
import { eventHandler } from "../handlers/event";

export async function handleBlock(block: SubstrateBlock): Promise<void> {
  const handler = await blockHandler(block);
  await handler.save();
}

export async function handleEvent(event: SubstrateEvent): Promise<void> {
  const handler = await eventHandler(event);
  await handler.save();
}
