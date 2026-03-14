import gearInventory from "../data/gear-inventory.json";
import { recommendationForRace } from "./race-recommender";

async function main() {
  const shoes = gearInventory;
  const raceId = "xtrail-2026";

  const result = recommendationForRace(shoes as any, raceId, 5);

  console.log("==== Trail Hub 赛道装备推荐 ====");
  console.log(`比赛：${result.race.name} (${result.race.distance_km}km)\n`);

  result.recommendations.forEach((item, i) => {
    const s = item.shoe as any;
    console.log(`No.${i + 1}  ${s.brand} ${s.model}`);
    console.log(`  总分: ${item.score.total.toFixed(1)}  [抓地:${item.score.traction.toFixed(1)}, 保护:${item.score.protection.toFixed(1)}, 缓震:${item.score.cushioning.toFixed(1)}, 轻量:${item.score.lightness.toFixed(1)}]`);
  });

  console.log("==== End ====");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});