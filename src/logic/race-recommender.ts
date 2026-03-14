import { ScoringConfig, TerrainProfile, TrailShoe, rankShoesForTerrain } from "./scoring-engine";
import raceProfiles from "../data/race-data.json";

export type RaceProfile = {
  raceId: string;
  name: string;
  distance_km: number;
  terrain: TerrainProfile;
};

export function getRaceById(raceId: string): RaceProfile | undefined {
  return (raceProfiles as RaceProfile[]).find((race) => race.raceId === raceId);
}

export function recommendationForRace(
  shoes: TrailShoe[],
  raceId: string,
  limit = 5,
  config: ScoringConfig = {},
) {
  const race = getRaceById(raceId);
  if (!race) {
    throw new Error(`无法找到 raceId=${raceId}`);
  }

  return {
    race,
    recommendations: rankShoesForTerrain(shoes, race.terrain, limit, config),
  };
}
