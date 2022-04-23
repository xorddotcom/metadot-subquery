import { SupportedChains } from "./chains";

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
  readonly [key in SupportedChains]: TokenInfo;
};

export const TOKEN_INFO: TokenInfoMap = {
  [SupportedChains.ACALA]: {
    name: "ACA",
    decimals: 12,
  },
  [SupportedChains.ASTAR]: {
    name: "ASTR",
    decimals: 18,
  },
  [SupportedChains.CONTEXTFREE]: {
    name: "CTX",
    decimals: 18,
  },
  [SupportedChains.KUSAMA]: {
    name: "KSM",
    decimals: 12,
  },
  [SupportedChains.KARURA]: {
    name: "KAR",
    decimals: 12,
  },
  [SupportedChains.POLKADOT]: {
    name: "DOT",
    decimals: {
      new: 10,
      old: 12,
    },
  },
  [SupportedChains.SHIBUYA]: {
    name: "SBY",
    decimals: 18,
  },
  [SupportedChains.SHIDEN]: {
    name: "SDN",
    decimals: 18,
  },
  [SupportedChains.WESTEND]: {
    name: "WND",
    decimals: 12,
  },
};
