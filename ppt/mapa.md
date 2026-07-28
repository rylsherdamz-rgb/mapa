---
marp: true
theme: uncover
class:
  - lead
  - invert
paginate: true
---

# **Mapa**
## GeoGuessr on Stellar Soroban

Guess locations from street view. Win XLM.

**Live:** [mapa-gamma-seven.vercel.app](https://mapa-gamma-seven.vercel.app)

---

# **The Problem**

- Centralized game servers can be shut down or manipulated
- Prize pools controlled by a single entity
- No transparency in scoring or payouts
- Users don't truly own in-game assets

---

# **The Solution**

**Decentralized geography guessing on Stellar Soroban**

- Smart contract‑governed game logic
- Transparent, on‑chain prize distribution
- Wallet‑based identity — no signups
- Every guess, stake, and payout verifiable on ledger

---

# **How It Works**

1. **Connect Wallet** — Freighter, xBull, Lobstr, or Hana
2. **See a Location** — Random Google Street View imagery
3. **Drop a Pin** — Guess where in the world it is
4. **Win XLM** — Closer guess = bigger payout from the pot

---

# **Architecture**

```
┌──────────────┐    ┌──────────────────┐
│ Next.js 16   │    │ Google Maps API  │
│ (React 19)   │───▶│ Street View+Map  │
│              │    └──────────────────┘
│ Wallet Kit   │
│ React Query  │    ┌──────────────────┐
│ Tailwind CSS │───▶│ Stellar Soroban  │
└──────────────┘    │                  │
                    │ • MapaGame       │
                    │ • LocationVault  │
                    └──────────────────┘
```

---

# **Smart Contracts**

### MapaGame
- Room lifecycle: create, join, guess, resolve, claim
- Haversine distance with integer math
- Prize: 250bps platform fee, rest to winner

### MapaLocationVault
- Location storage (lat/lng + images)
- Random location selection
- Admin CRUD

---

# **Contract Addresses**

| Contract | Address |
|----------|---------|
| **MapaGame** | `CCBTZEMT...` |
| **LocationVault** | `CC4RZMXH...` |
| **MAPATST2 Token** | `CD35R3Y5...` |

Deployed on **Stellar Testnet**

---

# **Prize Mechanics**

- **Entry fee:** 0.1 MAPATST2 per game
- **Score:** 0–1,000,000 (perfect = 1M, >20km = 0)
- **Prize:** `entry_fee × score / 1,000,000`
- **Tie:** Equal distance → both refunded

---

# **Tech Stack**

| Layer | Technology |
|-------|-----------|
| Blockchain | Stellar Soroban (Rust) |
| Frontend | Next.js 16, React 19, TS 5 |
| Styling | Tailwind CSS v4 |
| Maps | Google Maps API (Street View) |
| Wallet | Stellar Wallet Kit 2 |
| Data | TanStack React Query 5 |
| CI/CD | GitHub Actions + Vercel |

---

# **Testing**

- 11 unit tests via `cargo test`
- Room lifecycle (create → join → guess → resolve → claim)
- Auto‑match with fee calculation
- Tie resolution
- GitHub Actions CI

---

# **User Feedback**

50 testnet wallet holders submitted feedback via Google Form.

**Top requests:**
1. QR code integration
2. Onboarding improvements
3. Search / filter rooms
4. Leaderboards
5. Friend challenges

---

# **Future Roadmap**

- Mainnet deployment
- QR code for wallet sharing
- Onboarding tutorial
- Leaderboards & rankings
- Group/friend challenges
- Mobile app (React Native)

---

# **Get Involved**

- **GitHub:** [github.com/rylsherdamz-rgb/mapa](https://github.com/rylsherdamz-rgb/mapa)
- **Feedback:** Google Form
- **License:** MIT

**Built on Stellar Soroban**
