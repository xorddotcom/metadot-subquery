import { SubstrateExtrinsic } from "@subql/types";
import { Extrinsic } from "../types";

export async function ensureExtrinsic(id: string): Promise<void> {
  const extrinsic = await Extrinsic.get(id);

  if (!extrinsic) {
    await new Extrinsic(id).save();
  }
}

export const checkIfExtrinsicExecuteSuccess = (extrinsic: SubstrateExtrinsic): boolean => {
  const { events } = extrinsic;

  return !events.find(item => {
    const {
      event: { method, section },
    } = item;

    return section === "system" && method === "ExtrinsicFailed";
  });
};
