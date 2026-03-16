import { TrailShoe } from "./scoring-engine";
import { recommendShoesForRace, getRaceById } from "./race-recommender";
import gearInventory from "../data/gear-inventory.json";

async function main() {
  const raceId = "utms-2024"; // 默认测试 ID
  const race = getRaceById(raceId);
  const shoes = gearInventory as unknown as TrailShoe[];
  const recommendations = recommendShoesForRace(shoes, raceId);

  console.log("==== Trail Hub 赛道装备推荐 ====");
  if (race) {
    console.log(`比赛：${race.name} (${race.distance_km}km)\n`);
  }

  recommendations.forEach((shoe, i) => {
    console.log(`${i + 1}. ${shoe.brand} ${shoe.name} (评分: ${Math.round(shoe.finalScore || 0)})`);
  });
}

main().catch(console.error);
