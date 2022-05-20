#!/usr/bin/env bash

# Parameter - Value
#      b      input branch name
#
# Example:
# ./try.sh -b kusama
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

  BRANCH_INPUT=$b
}

# Pass all the arguments given to the script to the parser function
parser "$@"

# echo "Branch Input: $BRANCH_INPUT"

BRANCHES=()
MODIFIED_BRANCHES=()
eval "$(git branch --remotes --format='BRANCHES+=(%(refname:short))')"
for BRANCH in "${BRANCHES[@]}"; do
  WORDTOREMOVE="origin/"
  BRANCH=${BRANCH//$WORDTOREMOVE/}
  MODIFIED_BRANCHES+=(${BRANCH})
done

# echo "-------"
# echo "${BRANCHES[*]}"
# echo "-------"
# echo "${MODIFIED_BRANCHES[*]}"
# echo "-------"

# BRANCH_EXISTS=false

if [[ "${MODIFIED_BRANCHES[*]}" =~ "${BRANCH_INPUT}" ]]; then
  echo true
  # BRANCH_EXISTS=true
  # echo "$BRANCH_INPUT exists"
else
  echo false
  # BRANCH_EXISTS=false
  # echo "$BRANCH_INPUT does not exist"
fi

# echo "$BRANCH_EXISTS"
# export BRANCH_EXISTS
