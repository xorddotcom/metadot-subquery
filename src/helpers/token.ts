import { DOT_RE_DENOMINATION_BLOCK } from "../constants/misc";
import {
  CHAIN_TOKEN,
  OldDecimalFormat,
  OldDecimalsType,
  SupportedTokens,
  TOKEN_INFO,
} from "../constants/token";

export const getPolkadotDecimalsType = (blockNumber: number): OldDecimalsType => {
  if (blockNumber >= DOT_RE_DENOMINATION_BLOCK) return OldDecimalsType.new;
  return OldDecimalsType.old;
};

export const getTokenInfo = (
  token: SupportedTokens,
  oldDecimalsType: OldDecimalsType = OldDecimalsType.new
): { name: string; decimals: number } => {
  const name = TOKEN_INFO[token].name;
  let decimals: number;

  // it will be a number or an object containing new and old
  if (typeof TOKEN_INFO[token].decimals === "number") {
    decimals = TOKEN_INFO[token].decimals as number;
  } else {
    if (oldDecimalsType === OldDecimalsType.old) {
      decimals = (TOKEN_INFO[token].decimals as OldDecimalFormat).old;
    } else {
      decimals = (TOKEN_INFO[token].decimals as OldDecimalFormat).new;
    }
  }

  return { name, decimals };
};

export const getToken = (
  blockNumber?: number
): {
  name: string;
  decimals: number;
  modifiedDecimals: bigint;
} => {
  const token: SupportedTokens = CHAIN_TOKEN;

  const { name, decimals } = getTokenInfo(token, getPolkadotDecimalsType(blockNumber));

  const modifiedDecimals = BigInt("1" + "0".repeat(decimals));

  return { name, decimals, modifiedDecimals };
};
