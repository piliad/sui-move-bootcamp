import { ENV } from "../env";
import { suiClient } from "../suiClient";
import { SuiClientTypes } from "@mysten/sui/client";

/**
 * Gets all of the Hero NFTs owned by the given address.
 * Returns an array of their Object Ids.
 */
export const getOwnedHeroesIds = async (owner: string) => {
  let allHeroesIds: string[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    console.log(`Getting Heroes with cursor: ${cursor}`);
    const response: SuiClientTypes.ListOwnedObjectsResponse = await suiClient.listOwnedObjects({
      owner,
      type: `${ENV.PACKAGE_ID}::hero::Hero`,
      cursor,
    });
    hasNextPage = response.hasNextPage;
    cursor = response.cursor;
    allHeroesIds.push(...response.objects.map((obj) => obj.objectId));
  }

  return allHeroesIds;
};
