#!/usr/bin/env bash

# Handle multiple types of arguments and prints some variables
#
# Parameter - Value
#      n      input network name as written in chains.ts in lowercase
#      b      start block to index from
#      g      genesis hash of network
#      e      endpoint of network
#      d      dictionary of network
#
# Example:
# ./patch.sh -n polkadot
parser() {
  # Iterate over all the arguments
  while [ $# -gt 0 ]; do
    # Handle the arguments with no hyphen
    if [[ $1 != "-"* ]]; then
      # echo "Argument with no hyphen!"
      # echo $1
      # Assign true to argument $1
      declare $1=true
      # Shift arguments by one to the left
      shift
    # Handle the arguments with one hyphen
    elif [[ $1 == "-"[A-Za-z0-9]* ]]; then
      # Handle the flags
      # Handle the parameter-value cases
      # echo "Argument with one hyphen value!"
      # echo $1 $2
      # Remove the hyphen from $1
      local param="${1/-/}"
      # Assign argument $2 to $param
      declare $param="$2"
      # Shift by two
      shift 2
    fi
  done

  NAME=$n
  BLOCK_NUMBER=$b
  GENESIS_HASH=$g
  ENDPOINT=$e
  DICTIONARY=$d
}

# Pass all the arguments given to the script to the parser function
parser "$@"

echo "Selected Network: $NAME"
[[ ! -z "$BLOCK_NUMBER" ]] && echo "BLOCK_NUMBER: $BLOCK_NUMBER"
[[ ! -z "$GENESIS_HASH" ]] && echo "GENESIS_HASH: $GENESIS_HASH"
[[ ! -z "$ENDPOINT" ]] && echo "ENDPOINT: $ENDPOINT"
[[ ! -z "$DICTIONARY" ]] && echo "DICTIONARY: $DICTIONARY"

npx ts-node ./src/scripts/patch-chain.ts -n $NAME -b $BLOCK_NUMBER -g $GENESIS_HASH -e $ENDPOINT -d $DICTIONARY

echo "import { SupportedChains } from './chains';" > ./src/constants/network.ts

# convert to uppercase
NAME=`echo $NAME | tr '[a-z]' '[A-Z]'`

echo "export const CHAIN_TOKEN = SupportedChains.$NAME;" >> ./src/constants/network.ts

npx prettier --config ./.prettierrc.yaml --ignore-path ./.prettierignore --write ./src/constants/network.ts
