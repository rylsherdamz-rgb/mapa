#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec, log};

const DAY_IN_LEDGERS: u32 = 17280;
const BUMP_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Location {
    pub lat: i128,
    pub lng: i128,
    pub image_ref: String,
    pub active: bool,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum DataKey {
    Admin,
    NextLocationId,
    Location(u64),
    ActiveLocations,
}

#[contract]
pub struct MapaLocationVault;

#[contractimpl]
impl MapaLocationVault {
    pub fn initialize(env: Env, admin: Address) {
        let stored_admin: Option<Address> = env.storage().instance().get(&DataKey::Admin);
        if stored_admin.is_some() {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::NextLocationId, &1u64);
    }

    pub fn add_location(env: Env, admin: Address, lat: i128, lng: i128, image_ref: String) -> u64 {
        admin.require_auth();
        if env.storage().instance().get::<_, Address>(&DataKey::Admin).unwrap() != admin {
            panic!("not authorized");
        }

        let id: u64 = env.storage().instance().get(&DataKey::NextLocationId).unwrap();
        env.storage().instance().set(&DataKey::NextLocationId, &(id + 1));

        let location = Location {
            lat,
            lng,
            image_ref,
            active: true,
        };
        env.storage().persistent().set(&DataKey::Location(id), &location);
        env.storage().persistent().extend_ttl(&DataKey::Location(id), BUMP_AMOUNT, BUMP_AMOUNT);

        let mut active: Vec<u64> = env.storage().persistent().get(&DataKey::ActiveLocations).unwrap_or(Vec::new(&env));
        active.push_back(id);
        env.storage().persistent().set(&DataKey::ActiveLocations, &active);
        env.storage().persistent().extend_ttl(&DataKey::ActiveLocations, BUMP_AMOUNT, BUMP_AMOUNT);

        log!(&env, "location_added", id, lat, lng);
        id
    }

    pub fn remove_location(env: Env, admin: Address, location_id: u64) {
        admin.require_auth();
        if env.storage().instance().get::<_, Address>(&DataKey::Admin).unwrap() != admin {
            panic!("not authorized");
        }

        let mut location: Location = env.storage().persistent().get(&DataKey::Location(location_id)).unwrap();
        location.active = false;
        env.storage().persistent().set(&DataKey::Location(location_id), &location);
        env.storage().persistent().extend_ttl(&DataKey::Location(location_id), BUMP_AMOUNT, BUMP_AMOUNT);

        let mut active: Vec<u64> = env.storage().persistent().get(&DataKey::ActiveLocations).unwrap_or(Vec::new(&env));
        let mut i = 0;
        while i < active.len() {
            if active.get(i).unwrap() == location_id {
                active.remove(i);
                break;
            }
            i += 1;
        }
        env.storage().persistent().set(&DataKey::ActiveLocations, &active);
        env.storage().persistent().extend_ttl(&DataKey::ActiveLocations, BUMP_AMOUNT, BUMP_AMOUNT);
    }

    pub fn get_random_location(env: Env) -> u64 {
        let active: Vec<u64> = env.storage().persistent().get(&DataKey::ActiveLocations).unwrap_or(Vec::new(&env));
        if active.is_empty() {
            panic!("no active locations");
        }
        let idx: u64 = env.prng().gen_range(0u64..active.len() as u64);
        active.get(idx as u32).unwrap()
    }

    pub fn get_location(env: Env, location_id: u64) -> Location {
        env.storage().persistent().get(&DataKey::Location(location_id)).unwrap()
    }

    pub fn get_location_count(env: Env) -> u32 {
        let active: Vec<u64> = env.storage().persistent().get(&DataKey::ActiveLocations).unwrap_or(Vec::new(&env));
        active.len()
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, vec, Env, IntoVal, Symbol};

    fn setup_test() -> (Env, Address) {
        let env = Env::default();
        let admin = Address::generate(&env);
        MapaLocationVault::initialize(&env, admin.clone());
        (env, admin)
    }

    #[test]
    fn test_initialize() {
        let (env, admin) = setup_test();
        assert_eq!(MapaLocationVault::get_admin(&env), admin);
        assert_eq!(MapaLocationVault::get_location_count(&env), 0);
    }

    #[test]
    fn test_add_location() {
        let (env, admin) = setup_test();
        env.mock_all_auths();

        let id = MapaLocationVault::add_location(
            &env, admin.clone(),
            40748000, -74006000,
            &String::from_str(&env, "nyc_times_square"),
        );

        assert_eq!(id, 1);
        assert_eq!(MapaLocationVault::get_location_count(&env), 1);

        let location = MapaLocationVault::get_location(&env, id);
        assert_eq!(location.lat, 40748000);
        assert_eq!(location.lng, -74006000);
        assert!(location.active);
    }

    #[test]
    fn test_add_multiple_locations() {
        let (env, admin) = setup_test();
        env.mock_all_auths();

        let id1 = MapaLocationVault::add_location(&env, admin.clone(), 40748000, -74006000, &String::from_str(&env, "nyc"));
        let id2 = MapaLocationVault::add_location(&env, admin.clone(), 34052200, -118243700, &String::from_str(&env, "la"));
        let id3 = MapaLocationVault::add_location(&env, admin.clone(), 51488800, -132100, &String::from_str(&env, "london"));

        assert_eq!(id1, 1);
        assert_eq!(id2, 2);
        assert_eq!(id3, 3);
        assert_eq!(MapaLocationVault::get_location_count(&env), 3);
    }

    #[test]
    fn test_remove_location() {
        let (env, admin) = setup_test();
        env.mock_all_auths();

        let id = MapaLocationVault::add_location(&env, admin.clone(), 40748000, -74006000, &String::from_str(&env, "nyc"));
        MapaLocationVault::remove_location(&env, admin, id);

        let location = MapaLocationVault::get_location(&env, id);
        assert!(!location.active);
        assert_eq!(MapaLocationVault::get_location_count(&env), 0);
    }

    #[test]
    fn test_get_random_location() {
        let (env, admin) = setup_test();
        env.mock_all_auths();

        let id1 = MapaLocationVault::add_location(&env, admin.clone(), 40748000, -74006000, &String::from_str(&env, "nyc"));
        let id2 = MapaLocationVault::add_location(&env, admin.clone(), 34052200, -118243700, &String::from_str(&env, "la"));

        let rand_id = MapaLocationVault::get_random_location(&env);
        assert!(rand_id == id1 || rand_id == id2);
    }

    #[test]
    #[should_panic(expected = "no active locations")]
    fn test_get_random_empty() {
        let (env, _admin) = setup_test();
        MapaLocationVault::get_random_location(&env);
    }
}
