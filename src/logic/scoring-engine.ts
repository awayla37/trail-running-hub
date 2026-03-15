export const calculateMatchScore = (race: any, gear: any, environment: { wetness: number }) => {
  if (!gear || !race) return 0;
  let base = 70;
  
  if (gear.category === 'shoes') {
    const lugDepth = gear.specifications?.lug_depth || 4;
    const gripBase = gear.score_dimensions?.grip || 80;
    const slipperyPenalty = (environment.wetness / 100) * (6 - lugDepth) * 8;
    const technicalImpact = (race.technical_level || 3) * 5;
    base = gripBase + (lugDepth * 2) + technicalImpact - slipperyPenalty;
  } else if (gear.category === 'poles') {
    const portability = gear.score_dimensions?.portability || 80;
    const climbingWeight = (race.elevation || 2000) / 10000;
    base = portability + (climbingWeight * 20);
  }
  
  return Math.min(Math.max(Math.round(base), 0), 100);
};
