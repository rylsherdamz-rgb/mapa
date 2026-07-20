#!/usr/bin/env bash
set -euo pipefail

echo ""
echo "⚠️  WARNING: ABOUT TO DEPLOY TO MAINNET ⚠️"
echo ""
echo "You are about to deploy Mapa contracts to Stellar MAINNET."
echo "This will involve real XLM."
echo ""

read -p "Type 'DEPLOY MAINNET' to confirm: " confirmation
if [ "$confirmation" != "DEPLOY MAINNET" ]; then
  echo "Cancelled."
  exit 1
fi

if [ "${DRY_RUN:-false}" = "true" ]; then
  echo "DRY RUN — skipping actual deployment."
  exit 0
fi

SOROBAN_RPC="${SOROBAN_RPC:-https://soroban-rpc.mainnet.stellar.gateway.fm}"
SOROBAN_PASSPHRASE="${SOROBAN_PASSPHRASE:-Public Global Stellar Network ; September 2015}"
SOROBAN_SECRET_KEY="${MAINNET_DEPLOYER_SECRET:-}"

if [ -z "$SOROBAN_SECRET_KEY" ]; then
  echo "Error: MAINNET_DEPLOYER_SECRET not set"
  exit 1
fi

TOKEN_ADDRESS="${TOKEN_ADDRESS:-}"

if [ -z "$TOKEN_ADDRESS" ]; then
  echo "Error: TOKEN_ADDRESS not set"
  exit 1
fi

echo "Network: Mainnet"
echo "RPC: $SOROBAN_RPC"

NETWORK_ARGS="--rpc-url $SOROBAN_RPC --network-passphrase \"$SOROBAN_PASSPHRASE\" --source $SOROBAN_SECRET_KEY"

echo ""
echo "Building contracts..."
cd "$(dirname "$0")/.."

for contract in mapa_game mapa_location_vault; do
  cargo build --release --target wasm32v1-none --manifest-path contracts/$contract/Cargo.toml
done

echo ""
echo "Deploying contracts..."
VAULT_WASM=$(find contracts/target/wasm32v1-none/release -name "mapa_location_vault.wasm" | head -1)
VAULT_ID=$(stellar contract deploy --wasm "$VAULT_WASM" $NETWORK_ARGS)
echo "LocationVault deployed: $VAULT_ID"

GAME_WASM=$(find contracts/target/wasm32v1-none/release -name "mapa_game.wasm" | head -1)
GAME_ID=$(stellar contract deploy --wasm "$GAME_WASM" $NETWORK_ARGS)
echo "MapaGame deployed: $GAME_ID"

echo ""
echo "Initializing contracts..."
stellar contract invoke \
  --id "$VAULT_ID" \
  --fn initialize \
  --arg "$(stellar address $SOROBAN_SECRET_KEY)" \
  $NETWORK_ARGS

stellar contract invoke \
  --id "$GAME_ID" \
  --fn initialize \
  --arg "$(stellar address $SOROBAN_SECRET_KEY)" \
  --arg "$VAULT_ID" \
  --arg "$TOKEN_ADDRESS" \
  $NETWORK_ARGS

echo ""
echo "=== Mainnet Deployment Complete ==="
echo "MapaGame: $GAME_ID"
echo "LocationVault: $VAULT_ID"

cat > deployment.mainnet.json <<EOF
{
  "network": "mainnet",
  "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "contracts": {
    "mapa_game": "$GAME_ID",
    "mapa_location_vault": "$VAULT_ID"
  }
}
EOF
echo "Written to deployment.mainnet.json"
