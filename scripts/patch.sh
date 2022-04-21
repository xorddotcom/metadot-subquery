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
# echo "BLOCK_NUMBER: $BLOCK_NUMBER"
# echo "GENESIS_HASH: $GENESIS_HASH"
# echo "ENDPOINT: $ENDPOINT"
# echo "DICTIONARY: $DICTIONARY"

yarn ts-node ./scripts/patch-chain.ts -n $NAME

# setting network env variable
echo "NETWORK=$NAME" > .env
echo "NETWORK=$NAME" > .env.production
