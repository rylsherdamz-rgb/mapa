#!/usr/bin/env bash
set -euo pipefail

echo "=== Mapa Deploy to Testnet ==="

SOROBAN_RPC="${SOROBAN_RPC:-https://soroban-rpc.testnet.stellar.gateway.fm}"
SOROBAN_PASSPHRASE="${SOROBAN_PASSPHRASE:-Test SDF Network ; September 2015}"
SOROBAN_SECRET_KEY="${SOROBAN_SECRET_KEY:-}"
TOKEN_ADDRESS="${TOKEN_ADDRESS:-}"

if [ -z "$SOROBAN_SECRET_KEY" ]; then
  echo "Error: SOROBAN_SECRET_KEY not set"
  exit 1
fi

if [ -z "$TOKEN_ADDRESS" ]; then
  echo "Error: TOKEN_ADDRESS not set (use native XLM or a Stellar asset contract)"
  exit 1
fi

NETWORK_ARGS="--rpc-url $SOROBAN_RPC --network-passphrase \"$SOROBAN_PASSPHRASE\" --source $SOROBAN_SECRET_KEY"

echo ""
echo "Building contracts..."
cd "$(dirname "$0")/.."

for contract in mapa_game mapa_location_vault; do
  cargo build --release --target wasm32v1-none --manifest-path contracts/$contract/Cargo.toml
done

echo ""
echo "Deploying mapa_location_vault..."
VAULT_WASM=$(find contracts/target/wasm32v1-none/release -name "mapa_location_vault.wasm" | head -1)
VAULT_ID=$(stellar contract deploy --wasm "$VAULT_WASM" $NETWORK_ARGS)
echo "LocationVault deployed: $VAULT_ID"

echo ""
echo "Deploying mapa_game..."
GAME_WASM=$(find contracts/target/wasm32v1-none/release -name "mapa_game.wasm" | head -1)
GAME_ID=$(stellar contract deploy --wasm "$GAME_WASM" $NETWORK_ARGS)
echo "MapaGame deployed: $GAME_ID"

echo ""
echo "Initializing contracts..."

stellar contract invoke \
  --id "$VAULT_ID" \
  --fn initialize \
  --arg "$(stellar address $SOROBAN_SECRET_KEY)" \
  --arg "$TOKEN_ADDRESS" \
  $NETWORK_ARGS

stellar contract invoke \
  --id "$GAME_ID" \
  --fn initialize \
  --arg "$(stellar address $SOROBAN_SECRET_KEY)" \
  --arg "$VAULT_ID" \
  $NETWORK_ARGS

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Add to frontend/.env.local:"
echo "NEXT_PUBLIC_CONTRACT_MAPA_GAME=$GAME_ID"
echo "NEXT_PUBLIC_CONTRACT_MAPA_LOCATION_VAULT=$VAULT_ID"
