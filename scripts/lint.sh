#!/bin/sh

echo "Running lint:ts..."
yarn lint:ts
echo "Running lint:fix..."
yarn lint:fix
echo "Running prettier:check..."
yarn prettier:check
echo "Running typecheck..."
yarn typecheck

echo "Done"