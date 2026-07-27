# Mapa — GeoGuessr on Stellar

<p align="center"> <a href="https://mapa-gamma-seven.vercel.app/"><strong>🌍 Live Site →</strong></a> </p>

Mapa is a decentralized geography guessing game built on **Stellar Soroban**. Players guess locations from street view imagery and win prizes — the closer the guess, the bigger the payout.

## Preview

### Promo Video

[mapa-promo.mp4](frontend/public/mapa-promo.mp4) — [Raw on GitHub](https://raw.githubusercontent.com/rylsherdamz-rgb/mapa/main/frontend/public/mapa-promo.mp4)

### Screenshots

| Mobile | Desktop |
|--------|---------|
| ![Landing Mobile](images/mobile-landing.png) | ![Landing Desktop](images/landing.png) |
| ![Play Mobile](images/mobile-play.png) | ![Play Desktop](images/play.png) |

### Game States

![Victory](images/victory.png)
![Defeat](images/defeat.png)
![Room](images/room.png)
![Street View](images/street-view.png)
![Full Screen](images/full-screen.png)

## How It Works

1. **Connect Wallet** — Link your Stellar wallet (Freighter, xBull, Lobstr, Hana)
2. **See a Location** — Random street view imagery from around the world
3. **Place Your Guess** — Pin your guess on an interactive Google Map
4. **Win Prizes** — The closer you are, the more MAPATST2 you earn from the pot

## Architecture

```text
┌─────────────────────┐     ┌──────────────────────┐
│   Next.js Frontend  │     │   Google Maps API    │
│   (React 19)        │────▶│   Street View + Map  │
│                     │     └──────────────────────┘
│  - Wallet Provider  │
│  - Interactive Map  │     ┌──────────────────────┐
│  - React Query      │────▶│   Stellar Soroban    │
│  - Tailwind CSS     │     │   (Game Logic)       │
└─────────────────────┘     │                      │
                             │  - MapaGame          │
                             │  - MapaLocationVault │
                             └──────────────────────┘
```

## Project Structure

```
mapa/
├── contracts/
│   ├── mapa_game/              # Game contract (Rust, soroban-sdk)
│   │   ├── src/lib.rs          # 600+ lines: lifecycle, haversine, resolve
│   │   ├── Cargo.toml
│   │   └── tests/              # Integration tests
│   └── mapa_location_vault/    # Location vault contract (Rust)
│       ├── src/lib.rs          # CRUD for locations, random selection
│       └── Cargo.toml
├── frontend/                   # Next.js 16 + React 19 app
│   ├── src/
│   │   ├── app/                # Pages: /, /play, /promo
│   │   ├── components/
│   │   │   ├── wallet/         # WalletProvider, WalletConnector
│   │   │   └── game/           # StreetView, MapView, ResultScreen
│   │   └── lib/
│   │       ├── game.ts         # Typed contract integration layer
│   │       ├── soroban.ts      # readContract / writeContract engine
│   │       ├── stellar.ts      # RPC / Contract / Network helpers
│   │       └── contract-ids.ts # Contract address config
│   └── package.json
├── tests/                      # E2E game scripts (bash)
├── scripts/                    # Deployment helpers
└── deployment.json
```

## Frontend — Wallet Connection

**Location:** `frontend/src/components/wallet/`

The frontend integrates **4 Stellar wallets** via the **Stellar Wallets Kit** (`@creit.tech/stellar-wallets-kit`):

| Wallet | Kit Module |
|--------|-----------|
| **Freighter** | `@creit.tech/stellar-wallets-kit/modules/freighter` |
| **xBull** | `@creit.tech/stellar-wallets-kit/modules/xbull` |
| **Lobstr** | `@creit.tech/stellar-wallets-kit/modules/lobstr` |
| **Hana** | `@creit.tech/stellar-wallets-kit/modules/hana` |

- **WalletProvider** (`WalletProvider.tsx`) — React context providing `publicKey`, `isConnected`, `connect`, `disconnect`, `signTx`
- **WalletConnector** (`WalletConnector.tsx`) — Connect/disconnect button; shows truncated pubkey when connected
- **Landing page** — CTA button routes to `/play`; wallet nav shows connection state
- **Play page** — Full-screen "Connect Wallet" prompt if disconnected; all game operations use wallet-signed transactions

## Frontend — Smart Contract Integration

**Location:** `frontend/src/lib/`

| File | Role |
|------|------|
| `stellar.ts` | Creates `rpc.Server` & `Contract` instances; provides network passphrase |
| `soroban.ts` | Core engine: `readContract()` (simulate) and `writeContract()` (prepare → sign → submit → poll) |
| `contract-ids.ts` | Reads `NEXT_PUBLIC_CONTRACT_MAPA_GAME` and `NEXT_PUBLIC_CONTRACT_MAPA_LOCATION_VAULT` from env |
| `game.ts` | Typed wrappers for every contract method |

### Contract ↔ Frontend Function Mapping

| Contract Method | Frontend File | Frontend Function | UI Trigger |
|----------------|--------------|-------------------|------------|
| `auto_match` | `game.ts` | `autoMatch()` | /play — Create/Join match |
| `join_room` | `game.ts` | `joinRoom()` | /play — Join specific room |
| `leave_room` | `game.ts` | `leaveRoom()` | /play — Cancel pending room |
| `submit_guess` | `game.ts` | `submitGuess()` | /play — Place location guess |
| `claim_prize` | `game.ts` | `claimPrize()` | /play — Claim winnings |
| `get_room` | `game.ts` | `getRoom()` | /play — Poll room state |
| `get_open_rooms` | `game.ts` | `getOpenRooms()` | Landing, /play — List open rooms |
| `get_player_rooms` | `game.ts` | `getPlayerRooms()` | /play — Load user's rooms |
| `get_min_stake` | `game.ts` | `getMinStake()` | Landing, /play — Display min stake |
| `get_location` | `game.ts` | `getLocation()` | /play — Load street view location |
| `get_random_location` | `game.ts` | `getRandomLocation()` | /play — Pick random location |

**Stellar SDK:** `@stellar/stellar-sdk` v16.0.1 — used for `rpc.Server`, `Contract`, `xdr`, and ScVal conversion.

## Smart Contracts

### Contract Addresses (Testnet)

| Contract | Address | Explorer |
|----------|---------|----------|
| **MapaGame** | `CCBTZEMT35IPP2VXQ7HTEIXS7J24OEZL4T5S6WQRKKNXCIABMJGXKTQO` | [View](https://stellar.expert/explorer/testnet/contract/CCBTZEMT35IPP2VXQ7HTEIXS7J24OEZL4T5S6WQRKKNXCIABMJGXKTQO) |
| **MapaLocationVault** | `CC4RZMXHGZNGP3XMGXLIXQANIZPZRXWZ6Z63JAFAQA2SBN5QBUBXRCMO` | [View](https://stellar.expert/explorer/testnet/contract/CC4RZMXHGZNGP3XMGXLIXQANIZPZRXWZ6Z63JAFAQA2SBN5QBUBXRCMO) |
| **MAPATST2 Token** | `CD35R3Y5YJFCUKAWEFYKS7NN3QH4PI77YYYSOZWP6LG4KG233DJ6EMXJ` | [View](https://stellar.expert/explorer/testnet/contract/CD35R3Y5YJFCUKAWEFYKS7NN3QH4PI77YYYSOZWP6LG4KG233DJ6EMXJ) |

### Deployment Screenshots

![Game Contract Deployment](images/game_contract.png)
*MapaGame contract deployed on Stellar testnet*

![Location Vault Contract Deployment](images/location_contract.png)
*MapaLocationVault contract deployed on Stellar testnet*

![20 Test Passing Screenshot](images/testing.png)
*Testing Screenshots*

### MapaGame (`contracts/mapa_game/`)

- Game lifecycle: create room, join, guess, resolve, claim prize
- Entry fee handling via token transfer (MAPATST2)
- Haversine distance calculation with integer math (sin/cos/asin approximations)
- Tie resolution: equal distances refund both players
- Prize distribution: 250bps platform fee, remainder to winner
- Rooms 1–27 deployed and tested with 45 wallets on testnet

### MapaLocationVault (`contracts/mapa_location_vault/`)

- Location storage with lat/lng and image reference
- Random location selection
- Admin CRUD for locations

## Testing

### Contract Tests (Rust)

```bash
make test
```
11 unit tests covering: auto-match, join, leave, guess resolution, tie refunds, prize claiming, admin functions.

### E2E Game Scripts (Bash)

```bash
bash tests/play_all.sh          # Match all wallets and play games
bash tests/complete_matches.sh  # Finish remaining rooms
```

Scripts exercise the full contract lifecycle on testnet: auto_match → submit_guess → resolve → claim_prize, using 20 funded wallets, 20 registered identities, and 5 passer wallets.

### Integration Tests (Node)

Located under `frontend/src/lib/__tests__/` — test contract ID loading, ScVal argument helpers, distance formatting, and RoomState parsing.

## Prize Mechanics

- **Entry fee**: 100 MAPATST2 per game (10^8 stroops)
- **Haversine distance**: integer-arc distance in meters (sin² kept at SCALE², cos term divides by SCALE, min resolvable ~13m)
- **Prize**: `(stake × 2) × (1 − 250/10000)` — 2.5% platform fee, rest to winner
- **Tie**: equal distances refund both players their stake (no winner)

## Getting Started

### Prerequisites

- Rust + wasm32 target
- Stellar CLI (`stellar`)
- Node.js 20+
- Google Maps API key

### Setup

```bash
# Install contracts
make build-wasm

# Run contract tests
make test

# Install frontend
cd frontend && npm install

# Run frontend
cd frontend && npm run dev
```

### Environment

Copy `.env.example` to `frontend/.env.local` and configure:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SOROBAN_RPC` | Soroban RPC endpoint |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` or `pubnet` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JS API key |
| `NEXT_PUBLIC_CONTRACT_MAPA_GAME` | Deployed game contract ID |
| `NEXT_PUBLIC_CONTRACT_MAPA_LOCATION_VAULT` | Deployed vault contract ID |

## Deployment

```bash
# Deploy to testnet
make deploy

# Deploy to mainnet (requires confirmation)
make deploy-mainnet
```

### CI/CD Pipeline

The project uses GitHub Actions for automated CI/CD (`.github/workflows/`):

| Workflow | Triggers | Jobs |
|----------|----------|------|
| `contracts.yml` | Push/PR to `main`, tags, manual | Build → Test → Integration → Deploy |
| `frontend.yml` | Push/PR to `main` | Build + Lint |
| `deploy.yml` | Tags, manual | Deploy to Vercel |
| `soroban.yml` | Manual | Contract interaction tasks |

The **Contracts** workflow builds both WASM targets, runs unit tests and Node integration tests, and can deploy contracts via `workflow_dispatch` with a configurable target network (`testnet`/`mainnet`). Deployment uses the Stellar CLI binary with `--source-account` (secrets), pinned to Rust `1.84.0` with `wasm32v1-none` target.
