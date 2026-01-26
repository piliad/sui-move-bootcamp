import "dotenv/config";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { getSigner } from "./helpers/getSigner";

const PACKAGE_ID = process.env.PACKAGE_ID;

async function main() {
  console.log("\n🎲 Loot Crate - On-Chain Randomness Demo\n");

  // Load from environment
  const address = process.env.ADDRESS;
  const secretKey = process.env.SECRET_KEY;
  const network = (process.env.NETWORK || "testnet") as
    | "testnet"
    | "mainnet"
    | "devnet";

  if (!address || !secretKey) {
    console.error("❌ Missing environment variables.");
    console.error("   Copy .env.example to .env and fill in your credentials.");
    process.exit(1);
  }

  console.log(`📍 Using address: ${address}`);

  // Connect to network
  const client = new SuiClient({ url: getFullnodeUrl(network) });

  // Check balance
  const balance = await client.getBalance({ owner: address });
  const suiBalance = Number(balance.totalBalance) / 1_000_000_000;
  console.log(`💰 Balance: ${suiBalance.toFixed(4)} SUI`);

  if (suiBalance < 0.01) {
    console.error(
      "\n❌ Insufficient balance. Get testnet SUI from the faucet:"
    );
    console.error("   https://faucet.testnet.sui.io/");
    process.exit(1);
  }

  console.log("\n📦 Creating and opening loot crate...\n");

  const tx = new Transaction();
  // Create a loot crate
  const crate = tx.moveCall({
    target: `${PACKAGE_ID}::loot_crate::create_crate`,
    arguments: [tx.pure.vector("u8", [])],
  });

  // Open the crate with randomness
  tx.moveCall({
    target: `${PACKAGE_ID}::loot_crate::open_crate`,
    arguments: [crate, tx.object.random()],
  });

  // Execute transaction
  const result = await client.signAndExecuteTransaction({
    transaction: tx,
    signer: getSigner({ secretKey: secretKey }),
    options: {
      showEvents: true,
      showEffects: true,
    },
  });

  // Parse the event to get loot info
  const event = result.events?.find(
    (e) => e.type === `${PACKAGE_ID}::loot_crate::CrateOpenedEvent`
  );

  if (event && event.parsedJson) {
    const data = event.parsedJson as {
      item_name: number[];
      quantity: string;
    };

    // Convert item_name from bytes to string
    const itemName = String.fromCharCode(...data.item_name);
    const quantity = data.quantity;

    console.log("━".repeat(50));
    console.log(`\n  ✨ You looted ${quantity}x ${itemName}! ✨\n`);
    console.log("━".repeat(50));

    // Show rarity
    const rarityMap: Record<string, string> = {
      "Scrap Metal": "⬜ Common (50%)",
      "Fuel Cells": "🟦 Uncommon (30%)",
      "Rare Minerals": "🟪 Rare (15%)",
      "Ancient Artifact": "🟨 Legendary (5%)",
    };
    console.log(`\n  Rarity: ${rarityMap[itemName] || "Unknown"}`);
  }

  console.log(
    `\n🔗 Transaction: https://testnet.suivision.xyz/txblock/${result.digest}\n`
  );
}

main().catch(console.error);
