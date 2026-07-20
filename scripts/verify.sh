#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== Contract Verification ==="
echo ""

for contract in mapa_game mapa_location_vault; do
  wasm_path="contracts/target/wasm32v1-none/release/$contract.wasm"
  if [ ! -f "$wasm_path" ]; then
    echo "WASM not found for $contract — build first with 'make build-wasm'"
    continue
  fi

  hash=$(sha256sum "$wasm_path" | cut -d' ' -f1)
  echo "$contract: $hash"
done

echo ""
echo "Compare with deployment.json to ensure hashes match."
