import { SuiClientTypes } from "@mysten/sui/client";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { getFaucetHost, requestSuiFromFaucetV2 } from "@mysten/sui/faucet";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import { ENV } from "../env";

const mistToSui = (b: SuiClientTypes.Balance) =>
  Number(b.balance) / Number(MIST_PER_SUI);

test("SuiClient: getBalance + faucet (devnet)", async () => {
  // 1) Address to fund (must be a valid Sui address)
  const MY_ADDRESS = ENV.MY_ADDRESS;

  // 2) Initialize client (devnet)
  const suiClient = new SuiGrpcClient({
    baseUrl: `https://fullnode.${ENV.SUI_NETWORK}.sui.io:443`,
    network: ENV.SUI_NETWORK,
  });

  // 3) Balance BEFORE

  // 4) Request from faucet (devnet)
  await requestSuiFromFaucetV2({
    host: getFaucetHost(ENV.SUI_NETWORK),
    recipient: MY_ADDRESS,
  });

  // Wait 2 seconds before checking balance
  await new Promise((r) => setTimeout(r, 2000));

  // 5) Balance AFTER (no polling, just one check)

  // 6) Assert it increased
  expect(Number(after.balance)).toBeGreaterThan(
    Number(before.balance)
  );
  console.log(`Before: ${mistToSui(before)} SUI`);
  console.log(`After : ${mistToSui(after)} SUI`);
});
