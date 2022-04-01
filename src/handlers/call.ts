import { CallRecord } from "../types";

export async function ensureCallRecord(id: string): Promise<void> {
  const entity = await CallRecord.get(id);

  if (!entity) {
    await new CallRecord(id).save();
  }
}
