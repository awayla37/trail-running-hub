export interface GearItem {
  id: string;
  name: string;
  brand: string;
  category: 'shoes' | 'poles' | 'apparel';
  // 专业硬核字段
  specifications: {
    lug_depth?: number;      // 耳齿深度 (mm)
    drop?: number;           // 落差 (mm)
    weight?: number;         // 重量 (g)
    sections?: number;       // 杖的节数 (1/3/4)
    material?: string;       // 材质
  };
  score_dimensions: {
    grip: number;            // 抓地力 (1-100)
    durability: number;      // 耐用度 (1-100)
    portability?: number;    // 便携性 (针对杖)
  };
}
