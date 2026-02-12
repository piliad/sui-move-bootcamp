module package_upgrade::hero;

use sui::package;

use package_upgrade::hero_version::HeroVersion;

public struct HERO() has drop;

/// Hero NFT
public struct Hero has key, store {
    id: UID,
    health: u64,
    stamina: u64,
}

fun init(otw: HERO, ctx: &mut TxContext) {
    package::claim_and_keep(otw, ctx);
}

/// Anyone can mint a hero.
/// Hero starts with 100 health and 10 stamina.
public fun mint_hero(version: &HeroVersion, ctx: &mut TxContext) {
    version.check_is_valid();
    let hero = Hero {
        id: object::new(ctx),
        health: 100,
        stamina: 10
    };
    transfer::transfer(hero, ctx.sender());
}