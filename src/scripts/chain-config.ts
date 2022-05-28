import { SupportedChains } from "../constants/chains";
import {
  acala_type_definition,
  astar_type_definitions,
  bifrost_types_definitions,
  contextfree_type_definitions,
  karura_type_defition,
  shiden_type_definitions,
} from "./type-definitions";

const chainConfig = {
  [SupportedChains.ACALA]: {
    startBlock: 910989,
    chainId: "0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c",
    endpoint: "wss://acala-polkadot.api.onfinality.io/public-ws",
    dictionary: "https://api.subquery.network/sq/subquery/acala-dictionary",
    chaintypes: { typesBundle: acala_type_definition },
  },
  [SupportedChains.ASTAR]: {
    startBlock: 924132,
    chainId: "0x9eb76c5184c4ab8679d2d5d819fdf90b9c001403e9e17da2e14b6d8aec4029c6",
    endpoint: "wss://astar.api.onfinality.io/public-ws",
    dictionary: "https://api.subquery.network/sq/subquery/astar-dictionary",
    chaintypes: { typesBundle: astar_type_definitions },
  },
  [SupportedChains.BIFROST_MAINNET]: {
    startBlock: 1654897,
    chainId: "0x9f28c6a68e0fc9646eff64935684f6eeeece527e37bbe1f213d22caa1d9d6bed",
    endpoint: "wss://bifrost-rpc.liebi.com/ws",
    dictionary: "",
    chaintypes: bifrost_types_definitions,
  },
  [SupportedChains.BIFROST_TESTNET]: {
    startBlock: 180859,
    chainId: "0x8b290fa39a8808f29d7309ea99442c95bf964838aef14be5a6449ae48f8a5f1f",
    endpoint: "wss://bifrost-rpc.testnet.liebi.com/ws",
    dictionary: "https://api.subquery.network/sq/subquery/bifrost-parachain-dictionary",
    chaintypes: bifrost_types_definitions,
  },
  [SupportedChains.CONTEXTFREE]: {
    startBlock: 2929900,
    chainId: "0x6254c948b5eb7199a112cb308be3385c39c8c942625540ac749c77fe2aebc299",
    endpoint: "wss://contextfree.api.onfinality.io/public-ws",
    dictionary: "https://api.subquery.network/sq/subquery/contextfree-dictionary",
    chaintypes: { typesBundle: { spec: { contextfree: contextfree_type_definitions } } },
  },
  [SupportedChains.KUSAMA]: {
    startBlock: 12464962,
    chainId: "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe",
    endpoint: "wss://kusama.api.onfinality.io/public-ws",
    dictionary: "https://api.subquery.network/sq/subquery/kusama-dictionary",
    chaintypes: null,
  },
  [SupportedChains.KARURA]: {
    startBlock: 1820021,
    chainId: "0xbaf5aabe40646d11f0ee8abbdc64f4a4b7674925cba08e4a05ff9ebed6e2126b",
    endpoint: "wss://karura.api.onfinality.io/public-ws",
    dictionary: "https://api.subquery.network/sq/AcalaNetwork/karura-dictionary",
    chaintypes: { typesBundle: karura_type_defition },
  },
  [SupportedChains.POLKADOT]: {
    startBlock: 10399000,
    chainId: "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3",
    endpoint: "wss://polkadot.api.onfinality.io/public-ws",
    dictionary: "https://api.subquery.network/sq/subquery/polkadot-dictionary",
    chaintypes: null,
  },
  [SupportedChains.SHIBUYA]: {
    startBlock: 1347428,
    chainId: "0xddb89973361a170839f80f152d2e9e38a376a5a7eccefcade763f46a8e567019",
    endpoint: "wss://rpc.shibuya.astar.network",
    dictionary: "",
    chaintypes: null,
  },
  [SupportedChains.SHIDEN]: {
    startBlock: 1500245,
    chainId: "0xf1cf9022c7ebb34b162d5b5e34e705a5a740b2d0ecc1009fb89023e62a488108",
    endpoint: "wss://shiden.api.onfinality.io/public-ws",
    dictionary: "https://api.subquery.network/sq/subquery/shiden-dictionary",
    chaintypes: { typesBundle: { spec: { shiden: shiden_type_definitions } } },
  },
  [SupportedChains.WESTEND]: {
    startBlock: 10622832,
    chainId: "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e",
    endpoint: "wss://westend.api.onfinality.io/public-ws",
    dictionary: "https://api.subquery.network/sq/subquery/westend-dictionary",
    chaintypes: null,
  },
};

export default chainConfig;
