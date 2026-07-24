#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

STELLAR_NETWORK="--network testnet"
SOURCE="${SOROBAN_SECRET_KEY:-richie}"
BASE=(--source "$SOURCE" $STELLAR_NETWORK)

FEE_OPTS=(--inclusion-fee 1000000 --resource-fee 50000000)

echo "============================================"
echo "  Mapa Autonomous Game — Full Playthrough"
echo "============================================"
echo ""

# ------------------------------------------------------------------
# 1. Build WASM
# ------------------------------------------------------------------
echo ">>> Building contracts..."
for contract in mapa_game mapa_location_vault; do
  cargo build --release --target wasm32v1-none --manifest-path contracts/$contract/Cargo.toml 2>&1 | tail -1
done

GAME_WASM=$(find contracts/target/wasm32v1-none/release -name "mapa_game.wasm" | head -1)
VAULT_WASM=$(find contracts/target/wasm32v1-none/release -name "mapa_location_vault.wasm" | head -1)

# ------------------------------------------------------------------
# 2. Deploy custom token (SAC) that we control for testing
# ------------------------------------------------------------------
echo ">>> Deploying test token..."
ADMIN_ADDR=$(stellar keys address "$SOURCE")
TOKEN_ID=$(stellar contract asset deploy "${BASE[@]}" --asset "MAPATST:$ADMIN_ADDR" 2>&1 | tail -1 | grep -o 'C[0-9A-Za-z]*' | head -1)
echo "  Token: $TOKEN_ID"

# ------------------------------------------------------------------
# 3. Deploy contracts (uses salt for unique ID to avoid RPC timeout)
# ------------------------------------------------------------------
echo ">>> Deploying contracts..."
VAULT_ID=$(stellar contract deploy "${BASE[@]}" "${FEE_OPTS[@]}" --wasm "$VAULT_WASM" --salt "$(date +%s)" 2>&1 | tail -1 | grep -o 'C[0-9A-Za-z]*' | head -1)
echo "  Vault: $VAULT_ID"

GAME_ID=$(stellar contract deploy "${BASE[@]}" "${FEE_OPTS[@]}" --wasm "$GAME_WASM" --salt "$(date +%s)" 2>&1 | tail -1 | grep -o 'C[0-9A-Za-z]*' | head -1)
echo "  Game: $GAME_ID"

# ------------------------------------------------------------------
# 4. Initialize contracts
# ------------------------------------------------------------------
echo ">>> Initializing contracts..."
stellar contract invoke "${BASE[@]}" --id "$VAULT_ID" -- initialize --admin "$ADMIN_ADDR"
stellar contract invoke "${BASE[@]}" --id "$GAME_ID" -- initialize --admin "$ADMIN_ADDR" --vault "$VAULT_ID" --token "$TOKEN_ID"

# ------------------------------------------------------------------
# 5. Seed locations into vault
# ------------------------------------------------------------------
echo ">>> Seeding locations..."
LOCATIONS=(
  "40748000:-74006000:New_York"
  "51488800:-132100:London"
  "48710000:2327000:Paris"
  "41890000:12509000:Rome"
)

LOCATION_IDS=()
for loc in "${LOCATIONS[@]}"; do
  IFS=":" read -r lat lng name <<< "$loc"
  id=$(stellar contract invoke "${BASE[@]}" --id "$VAULT_ID" -- add_location --admin "$ADMIN_ADDR" --lat "$lat" --lng "$lng" --image_ref "$name" 2>&1 | tail -1)
  LOCATION_IDS+=("$id")
  echo "  $name (lat=$lat, lng=$lng) -> id=$id"
done

# ------------------------------------------------------------------
# 6. Create two test players with ephemeral keys
# ------------------------------------------------------------------
echo ">>> Creating test player accounts..."
P1_SEED="p1_auto_$(date +%s)"
P2_SEED="p2_auto_$(date +%s)"

stellar keys generate "$P1_SEED" 2>/dev/null || true
stellar keys generate "$P2_SEED" 2>/dev/null || true

P1_ADDR=$(stellar keys address "$P1_SEED")
P2_ADDR=$(stellar keys address "$P2_SEED")

echo "  Player 1: $P1_ADDR"
echo "  Player 2: $P2_ADDR"

# Fund via friendbot
echo ">>> Funding players with XLM..."
curl -s "https://friendbot.stellar.org?addr=$P1_ADDR" > /dev/null
curl -s "https://friendbot.stellar.org?addr=$P2_ADDR" > /dev/null
sleep 3
stellar keys fund "$P1_SEED" $STELLAR_NETWORK 2>/dev/null || true
stellar keys fund "$P2_SEED" $STELLAR_NETWORK 2>/dev/null || true

# ------------------------------------------------------------------
# 7. Mint test tokens to players (SAC: mint --to ADDR --amount AMOUNT)
# ------------------------------------------------------------------
echo ">>> Minting test tokens to players..."
stellar contract invoke "${BASE[@]}" --id "$TOKEN_ID" -- mint --to "$P1_ADDR" --amount 5000000000
stellar contract invoke "${BASE[@]}" --id "$TOKEN_ID" -- mint --to "$P2_ADDR" --amount 5000000000
echo "  Minted 5000 tokens to each player"

# ------------------------------------------------------------------
# 8. Play the game!
# ------------------------------------------------------------------
echo ""
echo "============================================"
echo "  GAME ON!"
echo "============================================"

LOCATION_ID=1
STAKE=100000000
TIME_LIMIT=300

# 8a. Player 1 auto_match (creates room)
echo ">>> Player 1 creating room..."
ROOM_ID=$(stellar contract invoke "${BASE[@]}" --source "$P1_SEED" --id "$GAME_ID" -- auto_match --player "$P1_ADDR" --stake "$STAKE" --location_id "$LOCATION_ID" --time_limit "$TIME_LIMIT" 2>&1 | tail -1)
echo "  Room created: $ROOM_ID"

# 8b. Player 2 auto_match (joins room)
echo ">>> Player 2 joining room..."
JOINED_ID=$(stellar contract invoke "${BASE[@]}" --source "$P2_SEED" --id "$GAME_ID" -- auto_match --player "$P2_ADDR" --stake "$STAKE" --location_id "$LOCATION_ID" --time_limit "$TIME_LIMIT" 2>&1 | tail -1)
echo "  Room joined: $JOINED_ID"

# 8c. Check room state
echo ">>> Room status:"
stellar contract invoke "${BASE[@]}" --id "$GAME_ID" -- get_room --room_id "$ROOM_ID"

# 8d. Player 1 submits guess (near actual location — should win)
echo ">>> Player 1 submitting guess..."
P1_GUESS_LAT=40747000
P1_GUESS_LNG=-74005000
ACTUAL_LAT=40748000
ACTUAL_LNG=-74006000
stellar contract invoke "${BASE[@]}" --source "$P1_SEED" --id "$GAME_ID" -- submit_guess --player "$P1_ADDR" --room_id "$ROOM_ID" --lat "$P1_GUESS_LAT" --lng "$P1_GUESS_LNG" --actual_lat "$ACTUAL_LAT" --actual_lng "$ACTUAL_LNG"
echo "  P1 guessed (lat=$P1_GUESS_LAT, lng=$P1_GUESS_LNG)"

# 8e. Player 2 submits guess (further away — should lose)
echo ">>> Player 2 submitting guess..."
P2_GUESS_LAT=40700000
P2_GUESS_LNG=-74000000
stellar contract invoke "${BASE[@]}" --source "$P2_SEED" --id "$GAME_ID" -- submit_guess --player "$P2_ADDR" --room_id "$ROOM_ID" --lat "$P2_GUESS_LAT" --lng "$P2_GUESS_LNG" --actual_lat "$ACTUAL_LAT" --actual_lng "$ACTUAL_LNG"
echo "  P2 guessed (lat=$P2_GUESS_LAT, lng=$P2_GUESS_LNG)"

# 8f. Check room state (should be Completed with a winner)
echo ">>> Room after guesses:"
stellar contract invoke "${BASE[@]}" --id "$GAME_ID" -- get_room --room_id "$ROOM_ID"

# 8g. Winner claims prize
echo ""
echo ">>> Claiming prize..."
stellar contract invoke "${BASE[@]}" --source "$P1_SEED" --id "$GAME_ID" -- claim_prize --player "$P1_ADDR" --room_id "$ROOM_ID"
echo "  Prize claimed by P1"

# ------------------------------------------------------------------
# 9. Summary
# ------------------------------------------------------------------
echo ""
echo "============================================"
echo "  GAME COMPLETE"
echo "============================================"
echo ""
echo "Contracts:"
echo "  Game:  $GAME_ID"
echo "  Vault: $VAULT_ID"
echo "  Token: $TOKEN_ID"
echo ""
echo "Players:"
echo "  P1: $P1_ADDR  (key: $P1_SEED)"
echo "  P2: $P2_ADDR  (key: $P2_SEED)"
echo ""
echo "Game result: Room $ROOM_ID, location $LOCATION_ID"
echo ""
