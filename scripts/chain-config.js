const acala_type_definitions = require("@acala-network/type-definitions");
const astar_type_definitions = {
  types: [
    {
      // on all versions
      minmax: [0, undefined],
      types: {
        Keys: "AccountId",
        Address: "MultiAddress",
        LookupSource: "MultiAddress",
        AmountOf: "Amount",
        Amount: "i128",
        SmartContract: {
          _enum: {
            Evm: "H160",
            Wasm: "AccountId",
          },
        },
        EraStakingPoints: {
          total: "Balance",
          stakers: "BTreeMap<AccountId, Balance>",
          formerStakedEra: "EraIndex",
          claimedRewards: "Balance",
        },
        EraRewardAndStake: {
          rewards: "Balance",
          staked: "Balance",
        },
        EraIndex: "u32",
      },
    },
  ],
};
const contextfree_type_definitions = {
  types: [
    {
      // on all versions
      minmax: [0, undefined],
      types: {
        ResourceId: "[u8; 32]",
        DepositNonce: "u64",
        ProposalStatus: {
          _enum: ["Initiated", "Approved", "Rejected"],
        },
        ProposalVotes: {
          votes_for: "Vec<AccountId>",
          votes_against: "Vec<AccountId>",
          status: "ProposalStatus",
        },
        BridgeTokenId: "U256",
        BridgeChainId: "u8",
        VestingPlan: {
          start_time: "u64",
          cliff_duration: "u64",
          total_duration: "u64",
          interval: "u64",
          initial_amount: "Balance",
          total_amount: "Balance",
          vesting_during_cliff: "bool",
        },
        ProposalId: "u32",
        ProjectId: "u32",
        ChainIndex: "u32",
        Protocol: {
          _enum: ["Solidity", "Substrate"],
        },
        Chain: {
          _protocol: "Protocol",
        },
        CrossChainAccount: {
          _enum: {
            Solidity: "H160",
            Substrate: "AccountId",
          },
        },
        IpfsHash: "Text",
        SolidityStrategy: {
          _enum: {
            ERC20Balance: "H160",
          },
        },
        SubstrateStrategy: {
          _enum: ["NativeBalance"],
        },
        Strategy: {
          _enum: {
            Solidity: "SolidityStrategy",
            Substrate: "SubstrateStrategy",
          },
        },
        Workspace: {
          _chain: "ChainIndex",
          strategies: "Vec<Strategy>",
        },
        UserGroup: {
          owner: "CrossChainAccount",
          admins: "Vec<CrossChainAccount>",
          maintainers: "Vec<CrossChainAccount>",
          proposers: "Option<Vec<CrossChainAccount>>",
        },
        Project: {
          usergroup: "UserGroup",
          data: "IpfsHash",
          workspaces: "Vec<Workspace>",
        },
        VotingFormat: {
          _enum: ["SingleChoice", "SplitVote"],
        },
        OptionIndex: "u8",
        PrivacyLevel: {
          _enum: {
            Opaque: "u8",
            Rank: "Null",
            Private: "Null",
            Public: "Null",
            Mixed: "Null",
          },
        },
        VotingPower: "U256",
        DAOProposalState: {
          finalized: "bool",
          snapshots: "Vec<Option<U256>>",
          blacklisted: "bool",
          votes: "Vec<VotingPower>",
          pub_voters: "Option<IpfsHash>",
          updates: "u32",
        },
        DAOProposal: {
          _author: "CrossChainAccount",
          _voting_format: "VotingFormat",
          _option_count: "OptionIndex",
          _data: "IpfsHash",
          _privacy: "PrivacyLevel",
          _start: "u64",
          _end: "u64",
          _frequency: "Option<u64>",
          _workspaces: "Vec<Workspace>",
          state: "DAOProposalState",
        },
        VoteUpdate: {
          project: "ProjectId",
          proposal: "ProposalId",
          votes: "Vec<VotingPower>",
          pub_voters: "Option<IpfsHash>",
        },
      },
    },
  ],
};
const shiden_type_definitions = {
  types: [
    {
      // on all versions
      minmax: [0, undefined],
      types: {
        Keys: "AccountId",
        Address: "MultiAddress",
        LookupSource: "MultiAddress",
        AmountOf: "Amount",
        Amount: "i128",
        SmartContract: {
          _enum: {
            Evm: "H160",
            Wasm: "AccountId",
          },
        },
        EraStakingPoints: {
          total: "Balance",
          stakers: "BTreeMap<AccountId, Balance>",
          formerStakedEra: "EraIndex",
          claimedRewards: "Balance",
        },
        PalletDappsStakingEraStakingPoints: {
          total: "Balance",
          stakers: "BTreeMap<AccountId, Balance>",
          formerStakedEra: "EraIndex",
          claimedRewards: "Balance",
        },
        EraRewardAndStake: {
          rewards: "Balance",
          staked: "Balance",
        },
        PalletDappsStakingEraRewardAndStake: {
          rewards: "Balance",
          staked: "Balance",
        },
        EraIndex: "u32",
      },
    },
  ],
};

module.exports = {
  acala: {
    startBlock: 763551,
    genesishash: "0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c",
    endpoint: "wss://acala-polkadot.api.onfinality.io/public-ws",
    dictionary: "https://api.subquery.network/sq/subquery/acala-dictionary",
    chaintypes: { typesBundle: acala_type_definitions.typesBundleForPolkadot },
  },
  astar: {
    startBlock: 780104,
    genesishash: "0x9eb76c5184c4ab8679d2d5d819fdf90b9c001403e9e17da2e14b6d8aec4029c6",
    endpoint: "wss://astar.api.onfinality.io/public-ws",
    dictionary: "https://api.subquery.network/sq/subquery/astar-dictionary",
    chaintypes: { typesBundle: astar_type_definitions },
  },
  contextfree: {
    startBlock: 2629236,
    genesishash: "0x6254c948b5eb7199a112cb308be3385c39c8c942625540ac749c77fe2aebc299",
    endpoint: "wss://contextfree.api.onfinality.io/public-ws",
    dictionary: "https://api.subquery.network/sq/subquery/contextfree-dictionary",
    chaintypes: { typesBundle: { spec: { contextfree: contextfree_type_definitions } } },
  },
  karura: {
    startBlock: 1738638,
    genesishash: "0xbaf5aabe40646d11f0ee8abbdc64f4a4b7674925cba08e4a05ff9ebed6e2126b",
    endpoint: "wss://karura.api.onfinality.io/public-ws",
    dictionary: "https://api.subquery.network/sq/subquery/acala-dictionary",
    chaintypes: { typesBundle: acala_type_definitions.typesBundleForPolkadot },
  },
  kusama: {
    startBlock: 10340000,
    genesishash: "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe",
    endpoint: "wss://kusama.api.onfinality.io/public-ws",
    dictionary: "https://api.subquery.network/sq/subquery/kusama-dictionary",
    chaintypes: {},
  },
  polkadot: {
    startBlock: 9959868,
    genesishash: "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3",
    endpoint: "wss://polkadot.api.onfinality.io/public-ws",
    dictionary: "",
    chaintypes: {},
  },
  shibuya: {
    startBlock: 1202459,
    genesishash: "0xddb89973361a170839f80f152d2e9e38a376a5a7eccefcade763f46a8e567019",
    endpoint: "wss://rpc.shibuya.astar.network",
    dictionary: "",
    chaintypes: {},
  },
  shiden: {
    startBlock: 1419733,
    genesishash: "0xf1cf9022c7ebb34b162d5b5e34e705a5a740b2d0ecc1009fb89023e62a488108",
    endpoint: "wss://shiden.api.onfinality.io/public-ws",
    dictionary: "https://api.subquery.network/sq/subquery/shiden-dictionary",
    chaintypes: { typesBundle: { spec: { shiden: shiden_type_definitions } } },
  },
  westend: {
    startBlock: 10319310,
    genesishash: "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e",
    endpoint: "wss://westend.api.onfinality.io/public-ws",
    dictionary: "",
    chaintypes: {},
  },
};
