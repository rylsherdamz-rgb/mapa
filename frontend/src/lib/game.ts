import { xdr } from "@stellar/stellar-sdk";
import { arg, readContract, writeContract } from "./soroban";
import { CONTRACTS } from "./contract-ids";

export enum GameState {
  AwaitingGuess = 0,
  Completed = 1,
  Claimed = 2,
}

export interface Game {
  player: string;
  location_id: number;
  guess_lat: number;
  guess_lng: number;
  distance: number;
  score: number;
  state: GameState;
  timestamp: number;
}

export interface Location {
  lat: number;
  lng: number;
  image_ref: string;
  active: boolean;
}

export async function startGame(publicKey: string, signTx: (tx: string) => Promise<string>): Promise<number> {
  const result = await writeContract(
    CONTRACTS.mapaGame,
    "start_game",
    [arg.address(publicKey)],
    publicKey,
    signTx
  );
  return Number(result);
}

export async function submitGuess(
  gameId: number,
  lat: number,
  lng: number,
  publicKey: string,
  signTx: (tx: string) => Promise<string>
) {
  const latVal = Math.round(lat * 1_000_000);
  const lngVal = Math.round(lng * 1_000_000);
  return writeContract(
    CONTRACTS.mapaGame,
    "submit_guess",
    [arg.address(publicKey), arg.u64(gameId), arg.i128(latVal), arg.i128(lngVal)],
    publicKey,
    signTx
  );
}

export async function getGame(gameId: number): Promise<Game> {
  const result: any = await readContract(CONTRACTS.mapaGame, "get_game", [arg.u64(gameId)]);
  return {
    player: result.player.toString(),
    location_id: Number(result.location_id),
    guess_lat: Number(result.guess_lat) / 1_000_000,
    guess_lng: Number(result.guess_lng) / 1_000_000,
    distance: Number(result.distance),
    score: Number(result.score),
    state: result.state as GameState,
    timestamp: Number(result.timestamp),
  };
}

export async function getPlayerGames(publicKey: string): Promise<number[]> {
  const result: any = await readContract(CONTRACTS.mapaGame, "get_player_games", [arg.address(publicKey)]);
  return result.map((id: any) => Number(id));
}

export async function getLocation(locationId: number): Promise<Location> {
  const result: any = await readContract(CONTRACTS.mapaLocationVault, "get_location", [arg.u64(locationId)]);
  return {
    lat: Number(result.lat) / 1_000_000,
    lng: Number(result.lng) / 1_000_000,
    image_ref: result.image_ref.toString(),
    active: result.active,
  };
}

export async function getRandomLocation(): Promise<number> {
  const result = await readContract(CONTRACTS.mapaLocationVault, "get_random_location", []);
  return Number(result);
}

export async function claimPrize(
  gameId: number,
  publicKey: string,
  signTx: (tx: string) => Promise<string>
) {
  return writeContract(
    CONTRACTS.mapaGame,
    "claim_prize",
    [arg.address(publicKey), arg.u64(gameId)],
    publicKey,
    signTx
  );
}

export async function withdraw(
  amount: number,
  to: string,
  publicKey: string,
  signTx: (tx: string) => Promise<string>
) {
  return writeContract(
    CONTRACTS.mapaGame,
    "withdraw",
    [arg.address(publicKey), arg.i128(amount), arg.address(to)],
    publicKey,
    signTx
  );
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatScore(score: number): number {
  return Math.round((score / 1_000_000) * 100);
}
