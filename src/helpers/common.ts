import { Vec } from "@polkadot/types";
import { CallBase } from "@polkadot/types/types/calls";
import { AnyTuple } from "@polkadot/types/types/codec";

import { BATCH_CALLS, TRANSFER_CALLS } from "../constants/call";

export function distinct<T>(array: Array<T>): Array<T> {
  return [...new Set(array)];
}

export function isBatch(call: CallBase<AnyTuple>): boolean {
  return call.section == "utility" && BATCH_CALLS.includes(call.method);
}

export function isProxy(call: CallBase<AnyTuple>): boolean {
  return call.section == "proxy" && call.method == "proxy";
}

export function isTransfer(call: CallBase<AnyTuple>): boolean {
  return call.section == "balances" && TRANSFER_CALLS.includes(call.method);
}

export function callsFromBatch(batchCall: CallBase<AnyTuple>): CallBase<AnyTuple>[] {
  return batchCall.args[0] as Vec<CallBase<AnyTuple>>;
}

export function callFromProxy(proxyCall: CallBase<AnyTuple>): CallBase<AnyTuple> {
  return proxyCall.args[2] as CallBase<AnyTuple>;
}
