/// A loot crate example demonstrating Sui's on-chain randomness.
///
/// Inspired by Eve, in this game, players explore space and salvage resources. This module
/// simulates opening a loot crate found in space, where the contents are
/// determined by on-chain randomness, ensuring fair and unpredictable rewards.
module loot_crate::loot_crate;
use sui::event::emit;
use sui::random::{Random, new_generator};
#[test_only]
use sui::test_scenario;

// Example item type IDs (for demonstration purposes)
const ITEM_SCRAP_METAL: u64 = 1;
const ITEM_FUEL_CELLS: u64 = 2;
const ITEM_RARE_MINERALS: u64 = 3;
const ITEM_ANCIENT_ARTIFACT: u64 = 4;

/// A loot crate found in space
public struct LootCrate has key, store {
    id: UID,
    location_hash: vector<u8>,
}

/// An item received from opening a loot crate
public struct SalvagedItem has key, store {
    id: UID,
    type_id: u64,
    name: vector<u8>,
    quantity: u64,
}

/// Emitted when a loot crate is opened and items are salvaged.
public struct CrateOpenedEvent has copy, drop {
    crate_id: ID,
    player: address,
    item_type_id: u64,
    item_name: vector<u8>,
    quantity: u64,
}

/// Create a new loot crate (would be called by game server/admin in production
/// and could be guarded by some sort of access control like the Capability Pattern).
public fun create_crate(location_hash: vector<u8>, ctx: &mut TxContext): LootCrate {
    LootCrate {
        id: object::new(ctx),
        location_hash,
    }
}

/// Open a loot crate and receive a random salvaged item.
///
/// Uses Sui's native on-chain randomness via the `Random` object (0x8).
///
/// Security notes:
/// - Marked as `entry` to prevent composition with other PTB commands
/// - Generator is created internally (not accepted as parameter)
/// - Sui automatically rejects PTBs with non-trasnfer commands after Random-consuming calls
entry fun open_crate(crate: LootCrate, random: &Random, ctx: &mut TxContext) {
    let LootCrate { id, location_hash: _ } = crate;
    let crate_id = id.to_inner(); // Hold for event emittion
    id.delete();

    // Create random generator
    let mut generator = new_generator(random, ctx);

    // Determine item type (weighted randomness)
    // 50% Scrap Metal, 30% Fuel Cells, 15% Rare Minerals, 5% Ancient Artifact
    let roll = generator.generate_u8_in_range(1, 100);
    let (type_id, name) = if (roll <= 50) {
        (ITEM_SCRAP_METAL, b"Scrap Metal")
    } else if (roll <= 80) {
        (ITEM_FUEL_CELLS, b"Fuel Cells")
    } else if (roll <= 95) {
        (ITEM_RARE_MINERALS, b"Rare Minerals")
    } else {
        (ITEM_ANCIENT_ARTIFACT, b"Ancient Artifact")
    };

    // Determine quantity (1-10 for common, 1-3 for rare)
    let quantity = if (type_id <= ITEM_FUEL_CELLS) {
        generator.generate_u64_in_range(1, 10)
    } else {
        generator.generate_u64_in_range(1, 3)
    };

    // Create the salvaged item
    let item = SalvagedItem {
        id: object::new(ctx),
        type_id,
        name,
        quantity,
    };

    emit(CrateOpenedEvent {
        crate_id,
        player: ctx.sender(),
        item_type_id: type_id,
        item_name: name,
        quantity,
    });

    transfer::transfer(item, ctx.sender());
}

#[test]
fun test_create_crate() {
    let mut scenario = test_scenario::begin(@0xCAFE);
    let crate = create_crate(b"test_location", scenario.ctx());

    assert!(crate.location_hash == b"test_location");

    // Clean up
    let LootCrate { id, location_hash: _ } = crate;
    id.delete();
    scenario.end();
}

#[test]
fun test_open_crate() {
    let system = @0x0;
    let player = @0xCAFE;

    let mut scenario = test_scenario::begin(system);

    // Create the Random object (must be done by system address @0x0)
    sui::random::create_for_testing(scenario.ctx());

    // Player creates and opens a crate
    scenario.next_tx(player);
    let random = scenario.take_shared<sui::random::Random>();
    let crate = create_crate(b"test_location", scenario.ctx());

    // Open the crate using the Random object
    open_crate(crate, &random, scenario.ctx());

    test_scenario::return_shared(random);

    // Verify player received a SalvagedItem
    scenario.next_tx(player);
    let item = scenario.take_from_sender<SalvagedItem>();

    assert!(item.type_id >= ITEM_SCRAP_METAL && item.type_id <= ITEM_ANCIENT_ARTIFACT);
    assert!(item.quantity >= 1);

    // Clean up
    let SalvagedItem { id, type_id: _, name: _, quantity: _ } = item;
    id.delete();

    scenario.end();
}
