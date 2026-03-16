export interface ScoringConfig {
  mudWeight: number;
  technicalWeight: number;
  gravelWeight: number;
  hardpackWeight: number;
}

export interface TerrainProfile {
  mud: number;
  technical_rock: number;
  gravel: number;
  hardpack: number;
  elevation_gain_pct: number;
}

export interface TrailShoe {
  id: string;
  name: string;
  brand: string;
  specifications: {
    lug_depth: number;
    weight?: number;
    stack_height?: number;
  };
  score_dimensions: {
    grip: number;
    durability: number;
    cushion?: number;
  };
}

export function rankShoesForTerrain(shoes: TrailShoe[], terrain: TerrainProfile) {
  return shoes.map(shoe => {
    // 基础评分逻辑：抓地力权重随地形湿滑度/技术难度增加
    const gripScore = shoe.score_dimensions.grip * (terrain.mud * 1.5 + terrain.technical_rock * 1.2) / 100;
    const finalScore = Math.min(100, 70 + gripScore);
    return { ...shoe, finalScore };
  }).sort((a, b) => b.finalScore - a.finalScore);
}
