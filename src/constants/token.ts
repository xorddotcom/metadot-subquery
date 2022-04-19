export enum SupportedTokens {
  ASTAR,
  ACALA,
  CONTEXTFREE,
  DUSTY,
  KUSAMA,
  KARURA,
  POLKADOT,
  SHIBUYA,
  SHIDEN,
  WESTEND,
}

export enum OldDecimalsType {
  new,
  old,
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
  [SupportedTokens.ASTAR]: {
    name: "ASTR",
    decimals: 18,
  },
  [SupportedTokens.ACALA]: {
    name: "ACA",
    decimals: 12,
  },
  [SupportedTokens.CONTEXTFREE]: {
    name: "CTX",
    decimals: 18,
  },
  [SupportedTokens.DUSTY]: {
    name: "PLD",
    decimals: 15,
  },
  [SupportedTokens.KUSAMA]: {
    name: "KSM",
    decimals: 12,
  },
  [SupportedTokens.KARURA]: {
    name: "KAR",
    decimals: 12,
  },
  [SupportedTokens.POLKADOT]: {
    name: "DOT",
    decimals: {
      new: 10,
      old: 12,
    },
  },
  [SupportedTokens.SHIBUYA]: {
    name: "SBY",
    decimals: 18,
  },
  [SupportedTokens.SHIDEN]: {
    name: "SDN",
    decimals: 18,
  },
  [SupportedTokens.WESTEND]: {
    name: "WND",
    decimals: 12,
  },
};

export const CHAIN_TOKEN = SupportedTokens.WESTEND;
