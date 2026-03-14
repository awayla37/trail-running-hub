import assert from "assert";
import { computeTrailShoeScore, TrailShoe, TerrainProfile } from "./scoring-engine";

const terrain: TerrainProfile = {
  mud: 30,
  technical_rock: 35,
  gravel: 15,
  hardpack: 20,
};

const shoe: TrailShoe = {
  brand: "Test",
  model: "VibramRock",
  weight_g: 240,
  drop_mm: 5,
  stack_height: "33/29mm",
  midsole_tech: "EVA",
  outsole_tech: "Vibram MegaGrip",
  lug_depth_mm: 6,
  rock_plate: true,
  upper_material: "Mesh",
  performance_tags: { traction: 5, protection: 4, cushioning: 4, responsiveness: 4 },
};

const result = computeTrailShoeScore(shoe, terrain);
console.log("score result", result);

assert(result.traction === 40, "traction should be full 40 when mud + vibram match");
assert(result.protection === 30, "protection should be full 30 when rock plate + stack>30");
assert(result.lightness === 10, "lightness should be full for weight < 250g");
assert(result.total <= 100, "total no more than 100");

console.log("All tests passed");
