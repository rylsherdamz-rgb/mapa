#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, Vec, log};

const DAY_IN_LEDGERS: u32 = 17280;
const BUMP_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;
const SCORE_PRECISION: i128 = 1_000_000;
const ENTRY_FEE_DEFAULT: i128 = 1_000_000;

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Game {
    pub player: Address,
    pub location_id: u64,
    pub guess_lat: i128,
    pub guess_lng: i128,
    pub distance: i128,
    pub score: i128,
    pub state: GameState,
    pub timestamp: u64,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum GameState {
    AwaitingGuess,
    Completed,
    Claimed,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum DataKey {
    Admin,
    EntryFee,
    Token,
    Vault,
    NextGameId,
    Game(u64),
    PlayerGames(Address),
}

#[contract]
pub struct MapaGame;

#[contractimpl]
impl MapaGame {
    pub fn initialize(env: Env, admin: Address, vault: Address, token: Address) {
        let stored_admin: Option<Address> = env.storage().instance().get(&DataKey::Admin);
        if stored_admin.is_some() {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Vault, &vault);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::EntryFee, &ENTRY_FEE_DEFAULT);
        env.storage().instance().set(&DataKey::NextGameId, &1u64);
    }

    pub fn set_entry_fee(env: Env, admin: Address, fee: i128) {
        admin.require_auth();
        if env.storage().instance().get::<_, Address>(&DataKey::Admin).unwrap() != admin {
            panic!("not authorized");
        }
        if fee < 0 {
            panic!("fee must be non-negative");
        }
        env.storage().instance().set(&DataKey::EntryFee, &fee);
    }

    pub fn start_game(env: Env, player: Address) -> u64 {
        player.require_auth();

        let fee: i128 = env.storage().instance().get(&DataKey::EntryFee).unwrap();
        if fee > 0 {
            let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
            token::Client::new(&env, &token).transfer(&player, &env.current_contract_address(), &fee);
        }

        let game_id: u64 = env.storage().instance().get(&DataKey::NextGameId).unwrap();
        env.storage().instance().set(&DataKey::NextGameId, &(game_id + 1));

        let game = Game {
            player: player.clone(),
            location_id: 0,
            guess_lat: 0,
            guess_lng: 0,
            distance: 0,
            score: 0,
            state: GameState::AwaitingGuess,
            timestamp: env.ledger().timestamp(),
        };
        env.storage().persistent().set(&DataKey::Game(game_id), &game);
        env.storage().persistent().extend_ttl(&DataKey::Game(game_id), BUMP_AMOUNT, BUMP_AMOUNT);

        let mut player_games: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::PlayerGames(player.clone()))
            .unwrap_or(Vec::new(&env));
        player_games.push_back(game_id);
        env.storage().persistent().set(&DataKey::PlayerGames(player.clone()), &player_games);

        log!(&env, "game_started", game_id, player);
        game_id
    }

    pub fn assign_location(env: Env, admin: Address, game_id: u64, location_id: u64) {
        admin.require_auth();
        if env.storage().instance().get::<_, Address>(&DataKey::Admin).unwrap() != admin {
            panic!("not authorized");
        }

        let mut game: Game = env.storage().persistent().get(&DataKey::Game(game_id)).unwrap();
        if game.state != GameState::AwaitingGuess {
            panic!("game not awaiting guess");
        }
        game.location_id = location_id;
        env.storage().persistent().set(&DataKey::Game(game_id), &game);
        env.storage().persistent().extend_ttl(&DataKey::Game(game_id), BUMP_AMOUNT, BUMP_AMOUNT);
    }

    pub fn submit_guess(env: Env, player: Address, game_id: u64, lat: i128, lng: i128) {
        player.require_auth();

        if lat < -90000000 || lat > 90000000 {
            panic!("latitude out of range");
        }
        if lng < -180000000 || lng > 180000000 {
            panic!("longitude out of range");
        }

        let mut game: Game = env.storage().persistent().get(&DataKey::Game(game_id)).unwrap();
        if game.player != player {
            panic!("not your game");
        }
        if game.state != GameState::AwaitingGuess {
            panic!("guess already submitted");
        }

        game.guess_lat = lat;
        game.guess_lng = lng;
        game.state = GameState::Completed;
        env.storage().persistent().set(&DataKey::Game(game_id), &game);
        env.storage().persistent().extend_ttl(&DataKey::Game(game_id), BUMP_AMOUNT, BUMP_AMOUNT);

        log!(&env, "guess_submitted", game_id, player, lat, lng);
    }

    pub fn resolve_game(env: Env, admin: Address, game_id: u64, actual_lat: i128, actual_lng: i128) -> i128 {
        admin.require_auth();
        if env.storage().instance().get::<_, Address>(&DataKey::Admin).unwrap() != admin {
            panic!("not authorized");
        }

        let mut game: Game = env.storage().persistent().get(&DataKey::Game(game_id)).unwrap();
        if game.state != GameState::Completed {
            panic!("game not completed");
        }

        let distance = Self::haversine_distance(actual_lat, actual_lng, game.guess_lat, game.guess_lng);
        let score = Self::calculate_score(distance);

        game.distance = distance;
        game.score = score;
        game.state = GameState::Completed;
        env.storage().persistent().set(&DataKey::Game(game_id), &game);
        env.storage().persistent().extend_ttl(&DataKey::Game(game_id), BUMP_AMOUNT, BUMP_AMOUNT);

        log!(&env, "game_resolved", game_id, distance, score);
        score
    }

    pub fn claim_prize(env: Env, player: Address, game_id: u64) {
        player.require_auth();

        let mut game: Game = env.storage().persistent().get(&DataKey::Game(game_id)).unwrap();
        if game.player != player {
            panic!("not your game");
        }
        if game.state != GameState::Completed {
            panic!("game not completed");
        }
        if game.score == 0 {
            panic!("no prize to claim");
        }

        game.state = GameState::Claimed;
        env.storage().persistent().set(&DataKey::Game(game_id), &game);
        env.storage().persistent().extend_ttl(&DataKey::Game(game_id), BUMP_AMOUNT, BUMP_AMOUNT);

        let fee: i128 = env.storage().instance().get(&DataKey::EntryFee).unwrap();
        let prize = fee * game.score / SCORE_PRECISION;

        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        if prize > 0 {
            token::Client::new(&env, &token).transfer(&env.current_contract_address(), &player, &prize);
        }

        log!(&env, "prize_claimed", game_id, player, prize);
    }

    pub fn withdraw(env: Env, admin: Address, amount: i128, to: Address) {
        admin.require_auth();
        if env.storage().instance().get::<_, Address>(&DataKey::Admin).unwrap() != admin {
            panic!("not authorized");
        }
        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        token::Client::new(&env, &token).transfer(&env.current_contract_address(), &to, &amount);
    }

    pub fn get_game(env: Env, game_id: u64) -> Game {
        env.storage().persistent().get(&DataKey::Game(game_id)).unwrap()
    }

    pub fn get_player_games(env: Env, player: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::PlayerGames(player))
            .unwrap_or(Vec::new(&env))
    }

    pub fn get_entry_fee(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::EntryFee).unwrap()
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    pub fn get_vault(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Vault).unwrap()
    }

    pub fn get_token(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Token).unwrap()
    }

    fn haversine_distance(lat1: i128, lng1: i128, lat2: i128, lng2: i128) -> i128 {
        let r: i128 = 6371000;

        let d_lat_rad = (lat1 - lat2) * SCORE_PRECISION / 57295779;
        let d_lng_rad = (lng1 - lng2) * SCORE_PRECISION / 57295779;
        let lat1_rad = lat1 * SCORE_PRECISION / 57295779;
        let lat2_rad = lat2 * SCORE_PRECISION / 57295779;

        let sin_dlat = Self::sin_approx(d_lat_rad);
        let sin_dlng = Self::sin_approx(d_lng_rad);
        let cos_lat1 = Self::cos_approx(lat1_rad);
        let cos_lat2 = Self::cos_approx(lat2_rad);

        let a = sin_dlat * sin_dlat / SCORE_PRECISION
            + cos_lat1 * cos_lat2 / SCORE_PRECISION * sin_dlng * sin_dlng / SCORE_PRECISION / SCORE_PRECISION;

        let c = Self::asin_approx(a) * 2;
        let distance = (r * c / SCORE_PRECISION).abs();

        if distance > 40075000 { 40075000 } else { distance }
    }

    fn sin_approx(x: i128) -> i128 {
        let p = 2 * 3141592;
        let x = x % p;
        let x = if x > 3141592 { p - x } else if x < -3141592 { -p - x } else { x };
        let x = x * SCORE_PRECISION / 1000000;
        let x2 = x * x / SCORE_PRECISION;
        let x3 = x2 * x / SCORE_PRECISION;
        let x5 = x3 * x2 / SCORE_PRECISION;
        let x7 = x5 * x2 / SCORE_PRECISION;
        x - x3 / 6 + x5 / 120 - x7 / 5040
    }

    fn cos_approx(x: i128) -> i128 {
        Self::sin_approx(1570796 - x.abs())
    }

    fn asin_approx(x: i128) -> i128 {
        let neg = x < 0;
        let x = x.abs();
        let mut result = 1570796i128;
        let mut term = x;
        let mut i = 1;
        while i < 20 && term > SCORE_PRECISION / 10000 {
            result = result - term / (2 * i - 1);
            term = term * x * x * (2 * i - 1) * (2 * i - 1) / (SCORE_PRECISION * 2 * i * (2 * i + 1));
            i += 1;
        }
        result = 1570796 - Self::sqrt(1570796i128 * 1570796 - result * result);
        if neg { -result } else { result }
    }

    fn sqrt(n: i128) -> i128 {
        if n <= 0 { return 0; }
        let mut x = n;
        let mut y = (x + 1) / 2;
        while y < x {
            x = y;
            y = (x + n / x) / 2;
        }
        x
    }

    fn calculate_score(distance: i128) -> i128 {
        let max_score = SCORE_PRECISION;
        if distance > 20000000 {
            return max_score / 100;
        }
        let score = max_score - distance * max_score / 20000000;
        if score < max_score / 100 { max_score / 100 } else { score }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, vec, Env, IntoVal, Symbol};

    fn setup_test() -> (Env, Address, Address, Address) {
        let env = Env::default();
        let admin = Address::generate(&env);
        let vault = Address::generate(&env);
        let token_id = env.register_stellar_asset_contract(admin.clone());
        let token = Address::from_string(&token_id.to_string());
        MapaGame::initialize(&env, admin.clone(), vault.clone(), token.clone());
        (env, admin, vault, token)
    }

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let vault = Address::generate(&env);
        let token_id = env.register_stellar_asset_contract(admin.clone());
        let token = Address::from_string(&token_id.to_string());
        MapaGame::initialize(&env, admin.clone(), vault.clone(), token.clone());
        assert_eq!(MapaGame::get_admin(&env), admin);
        assert_eq!(MapaGame::get_vault(&env), vault);
        assert_eq!(MapaGame::get_token(&env), token);
        assert_eq!(MapaGame::get_entry_fee(&env), ENTRY_FEE_DEFAULT);
    }

    #[test]
    fn test_start_game() {
        let (env, _admin, _vault, _token) = setup_test();
        let player = Address::generate(&env);

        env.mock_all_auths();
        let game_id = MapaGame::start_game(&env, player.clone());

        let game = MapaGame::get_game(&env, game_id);
        assert_eq!(game.player, player);
        assert_eq!(game.state, GameState::AwaitingGuess);
    }

    #[test]
    fn test_submit_guess() {
        let (env, _admin, _vault, _token) = setup_test();
        let player = Address::generate(&env);

        env.mock_all_auths();
        let game_id = MapaGame::start_game(&env, player.clone());
        MapaGame::submit_guess(&env, player.clone(), game_id, 40000000, -74000000);

        let game = MapaGame::get_game(&env, game_id);
        assert_eq!(game.guess_lat, 40000000);
        assert_eq!(game.guess_lng, -74000000);
        assert_eq!(game.state, GameState::Completed);
    }

    #[test]
    #[should_panic(expected = "latitude out of range")]
    fn test_invalid_lat() {
        let (env, _admin, _vault, _token) = setup_test();
        let player = Address::generate(&env);
        env.mock_all_auths();
        let game_id = MapaGame::start_game(&env, player.clone());
        MapaGame::submit_guess(&env, player, game_id, 100000000, 0);
    }

    #[test]
    fn test_haversine_same_point() {
        let distance = MapaGame::haversine_distance(40748000, -74006000, 40748000, -74006000);
        assert!(distance < 1000, "distance should be near 0, got {}", distance);
    }

    #[test]
    fn test_haversine_nyc_to_la() {
        let distance = MapaGame::haversine_distance(40712800, -74006000, 34052200, -118243700);
        assert!(distance > 3000000 && distance < 5000000, "got {}m", distance);
    }

    #[test]
    fn test_score_perfect() {
        assert_eq!(MapaGame::calculate_score(0), SCORE_PRECISION);
    }

    #[test]
    fn test_score_far() {
        assert_eq!(MapaGame::calculate_score(20000001), SCORE_PRECISION / 100);
    }

    #[test]
    fn test_score_partial() {
        let score = MapaGame::calculate_score(10000000);
        assert!(score > 0 && score < SCORE_PRECISION);
    }
}
