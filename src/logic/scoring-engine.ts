/**
 * Trail Hub 评分引擎（v1.0）
 * 原则来源：src/logic/scoring-system.md
 */

export type ShoePerformanceTags = {
  traction: number; // 1-5
  protection: number; // 1-5
  cushioning: number; // 1-5
  responsiveness: number; // 1-5
};

export type TrailShoe = {
  brand: string;
  model: string;
  weight_g: number;
  drop_mm: number;
  stack_height: string; // e.g. "33/29mm"
  midsole_tech: string;
  outsole_tech: string;
  lug_depth_mm: number;
  rock_plate: boolean;
  upper_material: string;
  performance_tags?: ShoePerformanceTags;
};

export type TerrainProfile = {
  mud: number; // 0-100
  technical_rock: number; // 0-100
  gravel: number; // 0-100
  hardpack: number; // 0-100
  elevation_gain_pct?: number; // 0-100
};

export type ScoreBreakdown = {
  traction: number;
  protection: number;
  cushioning: number;
  lightness: number;
  total: number;
};

export type ScoreReport = ScoreBreakdown & {
  reasons: string[];
  terrainWeight: {
    mud: number;
    technical_rock: number;
    gravel: number;
    hardpack: number;
  };
};

export type ScoringConfig = {
  terrainWeight?: {
    mud?: number;
    technical_rock?: number;
    gravel?: number;
    hardpack?: number;
  };
};

function parseStackHeightMm(stackHeight: string): number | null {
  // 支持格式: "33/29mm", "30mm", "35" 等
  const numeric = stackHeight.match(/\d+(\.\d+)?/g);
  if (!numeric || numeric.length === 0) return null;
  const first = numeric[0];
  const value = Number(first);
  return Number.isFinite(value) ? value : null;
}

export function computeTrailShoeScore(
  shoe: TrailShoe,
  terrain: TerrainProfile,
  config: ScoringConfig = {},
): ScoreReport {
  const tractionWeight = 40;
  const protectionWeight = 30;
  const cushioningWeight = 20;
  const lightnessWeight = 10;

  const reasons: string[] = [];
  const terrainWeight = {
    mud: config.terrainWeight?.mud ?? 1,
    technical_rock: config.terrainWeight?.technical_rock ?? 1,
    gravel: config.terrainWeight?.gravel ?? 1,
    hardpack: config.terrainWeight?.hardpack ?? 1,
  };

  const norm = (x: number) => Math.max(0, Math.min(x, 2));
  const wMud = norm(terrainWeight.mud);
  const wTech = norm(terrainWeight.technical_rock);
  const wGravel = norm(terrainWeight.gravel);
  const wHardpack = norm(terrainWeight.hardpack);

  let traction = 0;
  if (terrain.mud > 20 && shoe.lug_depth_mm >= 5) {
    const add = 20 * wMud;
    traction += add;
    reasons.push(`mud>20 + lug_depth>=5 => 抓地 ${add.toFixed(1)}`);
  }
  const outsoleText = shoe.outsole_tech ? shoe.outsole_tech.toLowerCase() : "";
  if (terrain.technical_rock > 30 && outsoleText.includes("vibram")) {
    const add = 20 * wTech;
    traction += add;
    reasons.push(`technical_rock>30 + Vibram => 抓地 ${add.toFixed(1)}`);
  }
  traction = Math.min(traction, tractionWeight);

  let protection = 0;
  if (terrain.technical_rock > 30 && shoe.rock_plate) {
    const add = 15 * wTech;
    protection += add;
    reasons.push(`technical_rock>30 + rock_plate => 保护 ${add.toFixed(1)}`);
  }
  const stackHeightMm = parseStackHeightMm(shoe.stack_height);
  if (stackHeightMm !== null && stackHeightMm > 30) {
    const add = 15 * (wGravel + wHardpack) / 2;
    protection += add;
    reasons.push(`stack_height>30 => 保护 ${add.toFixed(1)}`);
  }
  protection = Math.min(protection, protectionWeight);

  let cushioning = 0;
  if (stackHeightMm !== null) {
    if (stackHeightMm >= 40) cushioning += cushioningWeight;
    else if (stackHeightMm >= 35) cushioning += 16;
    else if (stackHeightMm >= 30) cushioning += 12;
    else if (stackHeightMm >= 25) cushioning += 8;
    else cushioning += 4;
    reasons.push(`stack_height ${stackHeightMm} => 缓震 ${cushioning}`);
  }

  if (shoe.performance_tags?.cushioning) {
    const scoreFromTag = (shoe.performance_tags.cushioning / 5) * cushioningWeight;
    if (scoreFromTag > cushioning) {
      cushioning = scoreFromTag;
      reasons.push(`performance_tags.cushioning=${shoe.performance_tags.cushioning} => 缓震 ${cushioning}`);
    }
  }
  cushioning = Math.min(cushioning, cushioningWeight);

  let lightness = 0;
  if (shoe.weight_g < 250) {
    lightness = lightnessWeight;
    reasons.push("weight_g<250 => 轻量10");
  } else {
    const penalty = Math.floor((shoe.weight_g - 250) / 20);
    lightness = Math.max(lightnessWeight - penalty, 0);
    reasons.push(`weight_g=${shoe.weight_g} => 轻量 ${lightness}（扣 ${penalty}）`);
  }

  let total = traction + protection + cushioning + lightness;
  total = Math.min(total, 100);

  return {
    traction,
    protection,
    cushioning,
    lightness,
    total,
    reasons,
    terrainWeight: { mud: wMud, technical_rock: wTech, gravel: wGravel, hardpack: wHardpack },
  };
}

export function rankShoesForTerrain(
  shoes: TrailShoe[],
  terrain: TerrainProfile,
  limit = 10,
  config: ScoringConfig = {},
) {
  return shoes
    .map((shoe) => ({
      shoe,
      score: computeTrailShoeScore(shoe, terrain, config),
    }))
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, limit);
}

// (可选) 示例内部函数，仅用于调试/手工运行
export function sampleRun() {
  const terrain: TerrainProfile = {
    mud: 25,
    technical_rock: 35,
    gravel: 20,
    hardpack: 20,
    elevation_gain_pct: 12,
  };

  const shoes: TrailShoe[] = [
    {
      brand: "Salomon",
      model: "Speedcross 5",
      weight_g: 290,
      drop_mm: 10,
      stack_height: "33/29mm",
      midsole_tech: "EnergyCell+",
      outsole_tech: "Contagrip",
      lug_depth_mm: 5,
      rock_plate: false,
      upper_material: "Mesh",
      performance_tags: { traction: 5, protection: 4, cushioning: 3, responsiveness: 4 },
    },
    {
      brand: "La Sportiva",
      model: "Bushido II",
      weight_g: 255,
      drop_mm: 6,
      stack_height: "22/18mm",
      midsole_tech: "Frixion",
      outsole_tech: "Vibram Mega-Grip",
      lug_depth_mm: 5,
      rock_plate: true,
      upper_material: "Mesh",
      performance_tags: { traction: 5, protection: 5, cushioning: 3, responsiveness: 5 },
    },
  ];

  return rankShoesForTerrain(shoes, terrain, 5);
}
