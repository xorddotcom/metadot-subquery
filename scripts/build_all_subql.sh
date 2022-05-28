#!/usr/bin/env bash

# run loop for all networks
NETWORKS=("acala" "astar" "bifrost_mainnet" "bifrost_testnet" "contextfree" "kusama" "karura" "polkadot" "shiden" "shibuya" "westend")

for NETWORK in ${NETWORKS[@]}; do
  echo "NETWORK: $NETWORK"
  yarn patchchain $NETWORK
  # cat ./project.yaml
  yarn codegen
  yarn build
done

echo "All builds complete"
git restore project.yaml src/constants/network.ts
