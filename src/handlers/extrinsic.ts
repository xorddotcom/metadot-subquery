import { SubstrateExtrinsic } from "@subql/types";

import { checkIfExtrinsicExecuteSuccess } from "../helpers/extrinsic";
import { Extrinsic } from "../types";
import { ensureAccount } from "./account";
import { ensureBlock } from "./block";

export async function ensureExtrinsic(id: string): Promise<void> {
  const extrinsic = await Extrinsic.get(id);

  if (!extrinsic) {
    await new Extrinsic(id).save();
  }
}

export async function handleExtrinsic(extrinsic: SubstrateExtrinsic): Promise<void> {
  const id = extrinsic?.extrinsic?.hash?.toString();
  const method = extrinsic?.extrinsic.method.method;
  const section = extrinsic?.extrinsic.method.section;
  const args = function (): string {
    const { args, meta, method } = extrinsic?.extrinsic || {};
    const { args: argsDef } = meta;
    const result = args.map((arg, index) => {
      const { name, type } = argsDef[index];

      return { name, type, method: method.method, section: method.section, value: arg.toJSON() };
    });

    return JSON.stringify(result);
  };
  const signer = extrinsic?.extrinsic?.signer?.toString();
  const nonce = extrinsic?.extrinsic?.nonce?.toBigInt() || BigInt(0);
  const timestamp = extrinsic?.block.timestamp;
  const blockHash = extrinsic?.block?.block?.hash?.toString();
  const isSigned = extrinsic?.extrinsic.isSigned;
  const signature = extrinsic?.extrinsic.signature.toString();
  const tip = extrinsic?.extrinsic.tip.toBigInt() || BigInt(0);
  const isSuccess = checkIfExtrinsicExecuteSuccess(extrinsic);

  await ensureBlock(blockHash);
  await ensureAccount(signer);

  const entity = new Extrinsic(id);
  entity.args = args();
  entity.isSigned = isSigned;
  entity.isSuccess = isSuccess;
  entity.method = method;
  entity.nonce = nonce;
  entity.section = section;
  entity.signature = signature;
  entity.timestamp = timestamp;
  entity.tip = tip;
  entity.blockId = blockHash;
  entity.signerId = signer;
  await entity.save();
}
