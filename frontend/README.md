# Mapa — GeoGuessr on Stellar Soroban

A multiplayer geography game built on the Stellar Soroban blockchain. Stake XLM, drop a pin on the map, and the closest guess wins the pot.

**Live demo:** [mapa.vercel.app](https://mapa.vercel.app)

## How It Works

1. Connect your Stellar wallet (Freighter, Albedo, or Wallet Kit)
2. Stake XLM to enter a match or browse open rooms
3. Receive a random satellite street-view location
4. Drop your pin on the map — closest guess wins

## Tech Stack

- **Smart Contracts:** Soroban (Rust) — `mapa_game` and `mapa_location_vault`
- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS v4, custom OKLCH design system
- **Maps:** Google Maps JavaScript API (Street View + Satellite)
- **Wallet:** Stellar Wallet Kit + Soroban RPC

## Getting Started

### Prerequisites

- Node.js 20+
- Stellar wallet (Freighter recommended)
- Soroban testnet XLM (use [Friendbot](https://laboratory.stellar.org/#account-creator?network=test))

### Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in your NEXT_PUBLIC_SOROBAN_RPC and contract addresses
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Smart Contract Deployment

Deployments are managed from the project root:

```bash
cd /home/richie/Projects/Mapa
./scripts/deploy.sh
```

Contract addresses are recorded in `deployment.json`.

## Project Structure

```
frontend/
├── src/
│   ├── app/          # Next.js pages and routes
│   ├── components/   # React components
│   ├── lib/          # Game logic, Soroban RPC helpers
│   └── styles/       # Global styles
├── public/           # Static assets (images, videos, icons)
├── vitest.config.ts  # Test configuration
└── next.config.ts    # Next.js configuration
```

## Images & Media

Responsive images for mobile and desktop are included in `public/`:
- `landing.png` / `mobile-landing.png` — Landing page screenshots
- `play.png` / `mobile-play.png` — Gameplay screenshots
- `promo-still.png` / `mapa-promo.mp4` — Promotional video still and full video
- `room.png`, `street-view.png`, `victory.png`, `defeat.png` — Game state screenshots

See the [Promo Page](/promo) for the full video and scene breakdown.

## Deployment

The frontend is deployed on Vercel. See the [deployment guide](../README.md) for details.

## License

MIT