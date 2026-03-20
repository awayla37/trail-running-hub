# Data Model（数据模型）

---

## 🧭 Overview（概述）

The system uses structured JSON data in MVP stage.

MVP阶段使用结构化JSON数据

---

## 📍 Route Model（路线模型）

Fields：

* id: string
* name: string
* type: race | training
* location: string
* country: string
* distance_km: number
* elevation_gain_m: number
* terrain: string[]
* difficulty: easy | moderate | hard

---

## 🏃 Example（示例）

{
"id": "ccc-100",
"name": "UTMB CCC",
"type": "race",
"location": "Chamonix",
"country": "France",
"distance_km": 101,
"elevation_gain_m": 6100,
"terrain": ["rocky", "technical"],
"difficulty": "hard"
}

---

## 👟 Gear Model（装备模型）

Fields：

* id: string
* brand: string
* model: string
* category: trail
* weight_g: number
* terrain: string[]
* grip_level: number (1-5)

---

## 👟 Example（示例）

{
"id": "speedgoat-5",
"brand": "HOKA",
"model": "Speedgoat 5",
"category": "trail",
"weight_g": 291,
"terrain": ["rocky", "technical"],
"grip_level": 5
}

---

## 🎒 Inventory（用户装备）

Runtime only（不存数据库）

* gear_id

---

## 🔗 Relationships（关系）

* One Route → Many Gear（一个路线对应多装备）
* One User → Many Gear（用户拥有多装备）

---

## 🧠 Data Principles（数据原则）

* Structured（结构化）
* Minimal（最小字段）
* Reliable（数据可靠）

---

## 🚀 Future Expansion（未来扩展）

Route：

* GPX file
* Surface ratio（地形比例）

Gear：

* price
* cushioning
* drop
* durability
