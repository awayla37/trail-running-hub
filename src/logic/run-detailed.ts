import { TrailShoe } from "./scoring-engine";
import { recommendShoesForRace } from "./race-recommender";
import gearInventory from "../data/gear-inventory.json";

export function runLocalAnalysis(raceId: string) {
  // 使用 unknown 作为中间层强制转换类型，绕过严格的属性检查
  const shoes = gearInventory as unknown as TrailShoe[];
  const results = recommendShoesForRace(shoes, raceId);
  console.log(`Analysis for ${raceId}:`, results);
  return results;
}
