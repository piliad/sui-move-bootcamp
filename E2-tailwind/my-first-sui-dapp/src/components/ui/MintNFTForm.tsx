import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { Transaction } from "@mysten/sui/transactions";
import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { useQueryClient } from "@tanstack/react-query";

export const MintNFTForm = () => {

    // hooks, variables, context
    const client = new SuiJsonRpcClient({url: getJsonRpcFullnodeUrl("devnet"), network: "devnet"});

    const account = useCurrentAccount();
    const { signAndExecuteTransaction, getClient } = useDAppKit();
    const suiClient = getClient();
    const queryClient = useQueryClient();

    // functions
    const handleMint = async () => {
        if (!account?.address) {
            alert("Please connect a wallet");
            return;
        }

        const tx = new Transaction();

        const hero = tx.moveCall({
            target: "0xc413c2e2c1ac0630f532941be972109eae5d6734e540f20109d75a59a1efea1e::hero::mint_hero",
            arguments: []
        });
        tx.transferObjects([hero], account.address);

        let resp;
        try {
            resp = await signAndExecuteTransaction({
                transaction: tx
            });
        }
        catch(e) {
            alert("Tx failed, you rejected it!");
            return;
        }

        if (resp.Transaction?.digest) {
            await suiClient.waitForTransaction({ digest: resp.Transaction.digest })
        }

        // queries[NETOWORK_ID][QUERY_ACTION][0]
        await queryClient.invalidateQueries(({
            predicate: (query) => 
                query.queryKey[0] === "ownedObjects" &&
                query.queryKey[1] === account.address
        }));


    }

    // return (ui)
    return (
        <div className="block">
            <button className="m-auto block p-2 bg-red-600 text-white text-2xl" onClick={handleMint}>Mint Hero</button>
        </div>
    );
}
