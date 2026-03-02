import { useCurrentClient } from "@mysten/dapp-kit-react";
import { useQuery } from "@tanstack/react-query";

export const HeroesList = () => {
    // variables & constants
    const HERO_REGISTRY_ID = "0xe994eae6a8b4c91c61786197cf29bfe5d99f4d37b8c36598b1866e30e9b206d8";
    const client = useCurrentClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["heroesList"],
        queryFn: async () => {

            const resp = await client.getObject({
                objectId: HERO_REGISTRY_ID,
                include: {
                    json: true
                }
            });

            return resp;
        }
    })
    
    return (
        <div>
            {
                isLoading || !data ? (
                    <div>Loading...</div>
                ): (
                    <div>
                        {
                            (data.object.json!.ids as any).map((id: any) => (
                                <a key={id} href={`https://suivision.xyz/object/${id}`}> {id} </a>
                            ))
                        }
                    </div>
                )
            }
        </div>
    );
}