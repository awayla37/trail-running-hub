import gearInventory from "../data/gear-inventory.json";
import { recommendationForRace } from "./race-recommender";

function print(thing: any) {
  console.log(thing);
}

async function main() {
  const shoes = gearInventory;
  const raceId = "xtrail-2026";
  const limit = 5;

  const result = recommendationForRace(shoes as any, raceId, limit);

  print(`===== Trail Hub 赛道：${result.race.name}（${result.race.distance_km}km）=====`);

  result.recommendations.forEach((item, index) => {
    const shoe: any = item.shoe;
    print(`\nNo.${index + 1} ${shoe.brand} ${shoe.model}, 总分 ${item.score.total.toFixed(1)}`);
    print(`  抓地 ${item.score.traction.toFixed(1)}, 保护 ${item.score.protection.toFixed(1)}, 缓震 ${item.score.cushioning.toFixed(1)}, 轻量 ${item.score.lightness.toFixed(1)}`);
    print("  解释:");
    (item.score.reasons || []).forEach((r: string) => print(`    - ${r}`));
  });

  print("============================================");
}

main().catch((err) => {
  console.error(err);
  throw err;
});