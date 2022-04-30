import { getToken } from "../helpers/token";

export function ensureToken(blockNumber: number) {
  const { name, modifiedDecimals } = getToken(blockNumber);

  return { name: name, decimals: modifiedDecimals.toString() };
}
