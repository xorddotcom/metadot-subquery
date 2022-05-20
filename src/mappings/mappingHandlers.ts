import { SubstrateBlock, SubstrateEvent } from "@subql/types";

import { blockHandler } from "../handlers/block";
import { eventHandler } from "../handlers/event";

export async function handleBlock(block: SubstrateBlock): Promise<void> {
  await blockHandler(block);
}

export async function handleEvent(event: SubstrateEvent): Promise<void> {
  await eventHandler(event);
}
