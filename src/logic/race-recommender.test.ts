import assert from "assert";
import { recommendShoesForRace } from "./race-recommender";
import { TrailShoe } from "./scoring-engine";

const shoes: TrailShoe[] = [
  {
    brand: "La Sportiva",
    model: "Ultra Raptor",
    weight_g: 260,
    drop_mm: 8,
    stack_height: "33/29mm",
    midsole_tech: "EVA",
    outsole_tech: "Vibram Mega-Grip",
    lug_depth_mm: 5,
    rock_plate: true,
    upper_material: "Mesh",
  },
  {
    brand: "Salomon",
    model: "Sense Ride",
    weight_g: 225,
    drop_mm: 8,
    stack_height: "30/24mm",
    midsole_tech: "EnergyCell",
    outsole_tech: "Contagrip",
    lug_depth_mm: 4,
    rock_plate: false,
    upper_material: "Mesh",
  },
];

const result = recommendShoesForRace(shoes, "xtrail-2026", 2);
console.log(result);
assert(result.race.raceId === "xtrail-2026");
assert(result.recommendations.length === 2);
assert(result.recommendations[0].shoe.brand === "La Sportiva");
console.log("race-recommender test passed");
