export const fetchRaceWeather = async (lat: number, lon: number) => {
  try {
    // 使用 Open-Meteo 免费 API，无需 Key
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=relative_humidity_2m,precipitation&timezone=auto`
    );
    const data = await response.json();
    
    return {
      humidity: data.current.relative_humidity_2m,
      precipitation: data.current.precipitation, // 单位：mm
      // 简单的逻辑转化：如果有降水或湿度超过 80%，则认为赛道湿滑
      isWet: data.current.precipitation > 0 || data.current.relative_humidity_2m > 80
    };
  } catch (error) {
    console.error("Weather fetch failed:", error);
    return null;
  }
};
