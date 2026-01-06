import { ENV } from "../env";
import {
  getHeroWithDisplay,
  updateHeroDisplay,
} from "../helpers/display";
import { suiClient } from "../suiClient";

const HERO_ID =
  "0x849f31eeec60b39e701c3cdcf633712d391416644cdbbdc2bda37dcf0702ce78";

describe("Display Handling", () => {

  it("View display", async () => {
    const objectWithDisplay = await getHeroWithDisplay(HERO_ID);
    const display = objectWithDisplay.data?.display;
    expect(display).toBeDefined();
    expect(display?.data).toBeDefined();
    expect(Object.keys(display?.data!)).toHaveLength(3);
    expect(display?.data?.name).toBe("Batman");
    expect(display?.data?.image_url).toBe(
      "https://aggregator.walrus-testnet.walrus.space/v1/blobs/N82B3_1kEvYs2jK3QIpgcLkP7cya4c7vXVBiExWyHYU"
    );
    expect(objectWithDisplay.data?.display?.data?.description).toBe(
      "Batman - A true Hero of the Sui ecosystem!"
    );
  });

  it("Update display", async () => {
    const result = await updateHeroDisplay(
      HERO_ID,
      "website",
      "https://superhero.com",
      ENV.USER_SECRET_KEY
    );
    expect(result.effects?.status?.status).toBe("success");

    const objectWithDisplay = await getHeroWithDisplay(HERO_ID);
    const display = objectWithDisplay.data?.display;
    expect(display).toBeDefined();
    expect(display?.data).toBeDefined();
    expect(Object.keys(display?.data!)).toHaveLength(4);
    expect(display?.data?.website).toBe("https://superhero.com");
  });
});
