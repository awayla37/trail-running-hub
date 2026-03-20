# Architecture（系统架构）

---

## 🧭 Overview（整体架构）

Trail Hub Engine is a data-driven recommendation system.

Trail Hub Engine 是一个基于数据驱动的装备推荐系统。

---

## 🧱 MVP Architecture（MVP 架构）

User（用户）
↓
UI Layer（前端界面 - Next.js）
↓
User Actions（用户操作）

* Select Route（选择路线）
* Input Gear（输入装备）
  ↓

---

| Route Database（路线数据） |
| Gear Database（装备数据）  |
------------------------

↓
Recommendation Engine（推荐引擎）
↓
Result（推荐结果）

---

## 🧠 Core Components（核心模块）

### 1. UI Layer（前端层）

* Built with Next.js
* Handles user interaction
* Displays routes, gear, and results

负责用户交互与界面展示

---

### 2. Data Layer（数据层）

* routes.json
* gear.json

Stores structured data for routes and gear

存储结构化路线与装备数据

---

### 3. Logic Layer（逻辑层）

* matcher（装备匹配）
* engine（推荐算法）

Handles core logic

负责核心逻辑处理

---

## 🔁 Data Flow（数据流）

1. User selects a route
2. System loads route data
3. User inputs gear
4. System matches gear from database
5. Recommendation engine calculates score
6. Results are displayed

用户流程：

选择路线 → 输入装备 → 匹配装备 → 推荐计算 → 展示结果

---

## 🚀 Future Architecture（未来架构）

* Database（PostgreSQL / Supabase）
* AI Layer（OpenAI API）
* GPX Processing（路线解析）
* User System（用户系统）

---

## 🧩 Design Principles（设计原则）

* Keep MVP simple（保持简单）
* Data first（数据优先）
* Decouple UI and logic（解耦前端与逻辑）
* AI as enhancement（AI作为增强）
