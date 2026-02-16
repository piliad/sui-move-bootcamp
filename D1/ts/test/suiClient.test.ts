import { SuiClientTypes } from "@mysten/sui/client";
import { getFaucetHost, requestSuiFromFaucetV2 } from "@mysten/sui/faucet";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import { ENV } from "@/env";

const mistToSui = (b: SuiClientTypes.GetBalanceResponse) =>
  Number(b.balance.balance) / Number(MIST_PER_SUI);

describe("SuiClient: Initialization and simple tests", () => {
  it("getBalance + faucet (devnet)", async () => {
    // 1) Address to fund (must be a valid Sui address)
    const MY_ADDRESS = ENV.MY_ADDRESS;

    // 2) Initialize client (devnet)
    const suiClient = new SuiGrpcClient({ baseUrl: getJsonRpcFullnodeUrl("devnet"), network: "devnet" });

    // 3) Balance BEFORE
    const before = await suiClient.getBalance({ owner: MY_ADDRESS });

    // 4) Request from faucet (devnet)
    await requestSuiFromFaucetV2({
      host: getFaucetHost("devnet"),
      recipient: MY_ADDRESS,
    });

    // Wait 2 seconds before checking balance
    await new Promise((r) => setTimeout(r, 2000));

    // 5) Balance AFTER (no polling, just one check)
    const after = await suiClient.getBalance({ owner: MY_ADDRESS });

    // 6) Assert it increased
    expect(Number(after.balance.balance)).toBeGreaterThan(
      Number(before.balance.balance)
    );
    console.log(`Before: ${mistToSui(before)} SUI`);
    console.log(`After : ${mistToSui(after)} SUI`);
  });
});
