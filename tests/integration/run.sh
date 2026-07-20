#!/usr/bin/env bash
set -euo pipefail

echo "=== Mapa Integration Tests ==="

if [ -z "${CONTRACT_MAPA_GAME:-}" ] || [ -z "${CONTRACT_MAPA_LOCATION_VAULT:-}" ]; then
  echo "Error: CONTRACT_MAPA_GAME and CONTRACT_MAPA_LOCATION_VAULT must be set"
  exit 1
fi

echo "Testing against:"
echo "  Game: $CONTRACT_MAPA_GAME"
echo "  Vault: $CONTRACT_MAPA_LOCATION_VAULT"
echo ""

# Run vitest
cd "$(dirname "$0")/.."
npx vitest run --reporter=verbose
