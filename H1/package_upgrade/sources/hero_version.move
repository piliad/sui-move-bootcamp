module package_upgrade::hero_version;

const EInvalidPackageVersion: u64 = 0;

const VERSION: u64 = 1;

/// Shared object with `version` which updates on every upgrade.
/// Used as input to force the end-user to use the latest contract version.
public struct HeroVersion has key {
    id: UID,
    version: u64
}

fun init(ctx: &mut TxContext) {
    transfer::share_object(HeroVersion { id: object::new(ctx), version: VERSION })
}

/// Function checking that the package-version matches the `Version` object.
public fun check_is_valid(self: &HeroVersion) {
    assert!(self.version == VERSION, EInvalidPackageVersion);
}