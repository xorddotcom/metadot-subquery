// import { config as dotenvConfig } from "dotenv";
// import { resolve } from "path";

// dotenvConfig({ path: resolve("./.env.production") });

// const NETWORK = process.env.NETWORK;

export enum SupportedChains {
  ACALA,
  ASTAR,
  CONTEXTFREE,
  KUSAMA,
  KARURA,
  POLKADOT,
  SHIBUYA,
  SHIDEN,
  WESTEND,
}

export const CHAIN_TOKEN = SupportedChains.WESTEND;

// export const CHAIN_TOKEN = NETWORK
//   ? SupportedChains[NETWORK?.toUpperCase()]
//   : SupportedChains.WESTEND;
// console.log("CHAIN_TOKEN >>> ", CHAIN_TOKEN);
