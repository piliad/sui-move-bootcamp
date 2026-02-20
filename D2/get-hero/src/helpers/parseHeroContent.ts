import { SuiClientTypes } from "@mysten/sui/client";

export interface Hero {
  id: string;
  health: string;
  stamina: string;
}

interface HeroContent {
  id: string ;
  health: string;
  stamina: string;
}

/**
 * Parses the content of a hero object in a SuiObjectResponse.
 * Maps it to a Hero object.
 */
export const parseHeroContent = (objectResponse: SuiClientTypes.GetObjectResponse): Hero => {
  const content = objectResponse.object.json as unknown as HeroContent;

  return {
    id : content.id,
    health : content.health,
    stamina: content.stamina,
  } as Hero;
};
