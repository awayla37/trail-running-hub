export interface Race {
  id: string;
  name: string;
  location: string;
  distance: number; // km
  elevation: number; // m
  technical_level: 1 | 2 | 3 | 4 | 5; // 1: 平路, 5: 极难岩石地形
  description: string;
}
