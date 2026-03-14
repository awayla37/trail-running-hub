# 🌲 Trail Hub - 越野跑专业装备与赛事仪表盘

> **项目状态**: Frontend MVP (Vibe Coding 范式)
> **核心定位**: 为越野跑“装备党”提供数字化管理、参数化研究及智能决策的专业空间。

## 🎯 项目目标 (Goal)
针对目前越野跑装备资讯碎片化（散落在小红书、微信群如“超会买俱乐部”、抖音等）的痛点，Trail Hub 致力于：
1. **数字化管理**: 建立深度的个人“数字化装备库”，涵盖鞋子、背包、头灯等全套强制装备。
2. **智能评分匹配**: 基于赛道地形（碎石、泥地、硬地等）对个人装备进行**百分制匹配打分**，提供科学的选鞋建议。
3. **垂直社区愿景**: 整合碎片化信息，形成基于真实实战参数的“评价即指南”社区，满足发烧友对硬核参数研究的极致追求。

## 👥 用户画像 (Personas)
* **装备研究员 (Gear Enthusiasts)**: 关注中底科技、大底配方、齿深等硬核参数的对比与收集。
* **实战决策者 (Race Performance)**: 需求是根据赛事地形比例，从个人库存中一键匹配出最合适的比赛方案。

## 🛠️ 核心功能 (Core Features)
* **Digital Closet (数字化装备间)**: 多类别参数化管理（鞋/包/灯），追踪里程与表现。
* **Gear Matcher (百分制匹配引擎)**: 核心算法根据赛道特征（Terrain Profile）对装备进行 0-100 分匹配。
* **Race Hub (赛事中心)**: 包含中国内地主流赛历及强制装备清单自动核对功能。

## 📂 目录结构 (Structure)
* `/src/data`: 核心 Schema 定义与 Mock 数据（含赛道地形数据）。
* `/src/logic`: 存储百分制匹配引擎的权重算法与计算逻辑。
* `/src/components`: 专业 UI 组件（如评分雷达图、参数对比表）。

## 开发者快速预览
在 `src/logic/scoring-engine.ts` 中实现：
- `computeTrailShoeScore(shoe, terrain)`
- `rankShoesForTerrain(shoes, terrain)`

示例：
```ts
import { sampleRun } from './src/logic/scoring-engine';
const ranking = sampleRun();
console.log(ranking);
```

测试：
1. 通过 `ts-node` (若已安装) 直接运行：
   - `npx ts-node src/logic/scoring-engine.test.ts`
   - `npx ts-node src/logic/race-recommender.test.ts`
   - `npx ts-node src/logic/run-main.ts`  // 运行简洁推荐演示
   - `npx ts-node src/logic/run-detailed.ts [raceId] [limit]`  // 运行可带明细解释的推荐演示
2. 如果你使用 Next.js 项目，也可把 `src/logic` 导入到前端页面，在浏览器控制台查看结果。

## UI 已完成（Next.js App Router）
当前已新增：
- `src/components/RaceRecommendationWidget.tsx`
- `src/app/page.tsx`

功能拓展：
- 赛道选择、最小总分过滤、品牌模糊过滤
- 地形权重可调（泥地/岩石/碎石/硬地）
- 权重保存到 LocalStorage，自动加载
- Top4 雷达图对比（Recharts）
- 装备库 CRUD（新增/删除），保存在 LocalStorage
- 导出推荐结果 CSV
- 中英语言切换
- 单鞋分项 + 解释原因 

运行：`npm run dev`（或 `pnpm dev`）后访问首页即可看到 UI。
