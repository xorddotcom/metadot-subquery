export enum SupportedTokens {
  POLKADOT,
  WESTEND,
  DUSTY,
  SHIBUYA,
  KUSAMA,
}

interface TokenInfo {
  readonly name: string;
  readonly decimals: number | { new: number; old: number };
}

type TokenInfoMap = {
  readonly [key in SupportedTokens]: TokenInfo;
};

export const TOKEN_INFO = {
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
