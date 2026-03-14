# 评分引擎逻辑说明 (v1.0)

## 百分制计算公式
总分 (100) = 抓地力(40) + 保护性(30) + 缓震感(20) + 轻量化(10)

## 现已实现的规则（代码：`src/logic/scoring-engine.ts`）

- 抓地力：
  - `mud > 20 && lug_depth_mm >= 5` -> +20
  - `technical_rock > 30 && outsole_tech 包含 Vibram` -> +20
- 保护性：
  - `technical_rock > 30 && rock_plate === true` -> +15
  - `stack_height(mm) > 30` -> +15
- 缓震感：
  - 根据 `stack_height` 分段奖励：
    - >=40：20
    - >=35：16
    - >=30：12
    - >=25：8
    - <25：4
  - 若存在 `performance_tags.cushioning`，则取两者中更高值（上限20）
- 轻量化：
  - `weight_g < 250` -> 10
  - 否则每超 20g 扣 1 分，最低 0

## 中间结果说明
`computeTrailShoeScore` 现在返回 `ScoreReport`：
- `traction`, `protection`, `cushioning`, `lightness`, `total`
- `reasons`：节点判定原因，用于 UI 解释
- `terrainWeight`：当前赛道输入拆解，便于前端打分机制可视化

## 使用示例
- `src/logic/run-main.ts`: 简洁推荐输出
- `src/logic/run-detailed.ts`: 带每项解释输出
- `src/logic/race-recommender.ts`: 基于 `raceId` 的推荐入口

