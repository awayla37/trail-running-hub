import { ScoringConfig, TerrainProfile, TrailShoe, rankShoesForTerrain } from "./scoring-engine";
import raceProfiles from "../data/race-data.json";

// 这里的定义必须和你的 JSON 文件字段一模一样
export type RaceProfile = {
  raceId: string;
  name: string;
  distance_km: number;
  terrain: {
    mud: number;
    technical_rock: number;
    gravel: number;
    hardpack: number;
    elevation_gain_pct: number;
  };
};

const DEFAULT_CONFIG: ScoringConfig = {
  mudWeight: 0.25,
  technicalWeight: 0.25,
  gravelWeight: 0.25,
  hardpackWeight: 0.25
};

export function getRaceById(id: string): RaceProfile | undefined {
  // 现在字段匹配了，TypeScript 不会再报错
  return (raceProfiles as unknown as RaceProfile[]).find(r => r.raceId === id);
}

export function recommendShoesForRace(
  shoes: TrailShoe[],
  raceId: string,
  limit = 5,
  config: ScoringConfig = DEFAULT_CONFIG
) {
  const race = getRaceById(raceId);
  if (!race) {
    return [];
  }
  // 将 terrain 映射回 rankShoesForTerrain 需要的格式
  const terrainProfile: TerrainProfile = race.terrain;
  return rankShoesForTerrain(shoes, terrainProfile).slice(0, limit);
}
