import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { ENV } from "../env";
import { getAddress } from "./getAddress";
import { suiClient } from "../suiClient";
import { getSigner } from "./getSigner";

/**
 * Builds, signs, and executes a transaction for:
 * * minting a Hero NFT
 * * minting a Weapon NFT
 * * attaching the Weapon to the Hero
 * * transferring the Hero to the signer's address
 */
export const mintHeroWithWeapon =
  async (): Promise<SuiTransactionBlockResponse> => {
    const tx = new Transaction();
    const hero = tx.moveCall({
      target: `${ENV.PACKAGE_ID}::hero::new_hero`,
      arguments: [
        tx.pure.string("My Hero!"),
        tx.pure.u64(10),
        tx.object(ENV.HEROES_REGISTRY_ID),
      ],
      typeArguments: [],
    });
    const weapon = tx.moveCall({
      target: `${ENV.PACKAGE_ID}::hero::new_weapon`,
      arguments: [tx.pure.string("My Weapon!"), tx.pure.u64(100)],
      typeArguments: [],
    });
    tx.moveCall({
      target: `${ENV.PACKAGE_ID}::hero::equip_weapon`,
      arguments: [hero, weapon],
      typeArguments: [],
    });
    tx.transferObjects([hero], getAddress({ secretKey: ENV.USER_SECRET_KEY }));
    return suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: getSigner({ secretKey: ENV.USER_SECRET_KEY }),
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });
  };
