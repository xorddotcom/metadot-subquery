import { SubstrateEvent, SubstrateExtrinsic } from "@subql/types";
import { ensureBlock } from "../helpers/block";
import { checkIfExtrinsicExecuteSuccess } from "../helpers/extrinsic";
import { Extrinsic } from "../types";

export async function createExtrinsic(extrinsic: SubstrateExtrinsic): Promise<void> {
  const id = extrinsic?.extrinsic?.hash?.toString();
  const method = extrinsic?.extrinsic.method.method;
  const section = extrinsic?.extrinsic.method.section;
  const args = function() {
    const { args, meta } = extrinsic?.extrinsic || {};
    const { args: argsDef } = meta;
    const result = args.map((arg, index) => {
      const { name, type } = argsDef[index];

      return { name, type, value: arg.toHuman() };
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

  const entity = new Extrinsic(id);

  await ensureBlock(blockHash);

  entity.method = method;
  entity.section = section;
  entity.args = args();
  entity.signerId = signer;
  entity.nonce = nonce;
  entity.isSigned = isSigned;
  entity.timestamp = timestamp;
  entity.signature = signature;
  entity.tip = tip;
  entity.isSuccess = isSuccess;
  entity.blockId = blockHash;

  await entity.save();
}
