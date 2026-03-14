# Trail Hub 开发日志

## 2026-03-14

### 完成范围

1. 核心评分引擎实现
   - `src/logic/scoring-engine.ts`
   - 实现 `computeTrailShoeScore`：抓地力40分、保护性30分、缓震20分、轻量化10分
   - 增强：`ScoringConfig` 支持地形权重（mud / technical_rock / gravel / hardpack）
   - `rankShoesForTerrain` 支持配置透传

2. 赛道推荐入口
   - `src/logic/race-recommender.ts`
   - 方法 `recommendationForRace(shoes, raceId, limit, config)`

3. 本地数据与演示工具
   - `src/data/gear-inventory.json` (默认鞋数据)
   - `src/data/race-data.json` (赛道数据)
   - `src/logic/run-main.ts` (简洁控制台示例)
   - `src/logic/run-detailed.ts` (详细解释型控制台示例)

4. 前端 UI 实现（Next.js + Tailwind）
   - `src/components/RaceRecommendationWidget.tsx`
     - 赛道选择、最低分、品牌筛选
     - 地形权重滑块 + 策略按钮（均衡/泥地/岩石/轻量）
     - 本地库存 CRUD（新增/删除）
     - 本地存储：`localStorage` `trailHubGearInventory`, `trailHubTerrainWeights`, `trailHubStrategy`
     - 结果雷达图（Recharts）
     - 推荐导出 CSV
     - 中英切换
   - `src/app/page.tsx`

5. 文档更新
   - `README.md` 补充功能和运行说明

### 说明

- 逻辑已完成，UI 已完成。
- 依赖需安装：`react`, `react-dom`, `recharts`, `@types/react`, `@types/react-dom`。
- 运行命令：`npm run dev` 或 `pnpm dev`。

### 测试链接

- `http://localhost:3000`

> 该链接在本地开发环境可访问。请先启动服务器。
