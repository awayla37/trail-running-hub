export const parseTerrainDescription = async (description: string) => {
  // 模拟网络延迟，增加“加载中”的仪式感
  await new Promise(resolve => setTimeout(resolve, 800));

  const text = description.toLowerCase();
  
  // 关键词匹配逻辑
  const result = {
    technical_level: 2, // 默认难度
    wetness: 10,       // 默认干燥
    rock_exposure: 0.2, // 默认土路
    message: "分析完成：已识别基础路况"
  };

  if (text.includes("雨") || text.includes("烂泥") || text.includes("滑")) {
    result.wetness = 85;
    result.message = "检测到湿滑预警 🌧️";
  }
  
  if (text.includes("碎石") || text.includes("乱石") || text.includes("技术")) {
    result.technical_level = 5;
    result.rock_exposure = 0.9;
    result.message = "检测到高难度技术地形 🪨";
  }

  if (text.includes("陡") || text.includes("爬升")) {
    result.technical_level = Math.max(result.technical_level, 4);
  }

  return result;
};
