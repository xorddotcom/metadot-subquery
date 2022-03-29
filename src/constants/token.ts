import { DOT_RE_DENOMINATION_BLOCK } from "./misc";

export enum SupportedTokens {
  POLKADOT,
  WESTEND,
  DUSTY,
  SHIBUYA,
  KUSAMA,
}

export interface OldDecimalFormat {
  new: number;
  old: number;
}

export interface TokenInfo {
  readonly name: string;
  readonly decimals: number | OldDecimalFormat;
}

export type TokenInfoMap = {
  readonly [key in SupportedTokens]: TokenInfo;
};

export const TOKEN_INFO: TokenInfoMap = {
  [SupportedTokens.POLKADOT]: {
    name: "DOT",
    decimals: {
      new: 10,
      old: 12,
    },
  },
  [SupportedTokens.WESTEND]: {
    name: "WND",
    decimals: 12,
  },
  [SupportedTokens.DUSTY]: {
    name: "PLD",
    decimals: 15,
  },
  [SupportedTokens.SHIBUYA]: {
    name: "SBY",
    decimals: 18,
  },
  [SupportedTokens.KUSAMA]: {
    name: "KSM",
    decimals: 12,
  },
};

export enum OldDecimalsType {
  new,
  old,
}

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
