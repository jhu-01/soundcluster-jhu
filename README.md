# 🌌 SoundCluster
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A music analytics dashboard leveraging Gemini LLM to map multi-dimensional emotional data from tracks and lyrics into an immersive 3D space (R3F/WebGL).

Boostcamp Web & Mobile SNU 2026 — Solo Project

---

## 🛠️ Tech Stack & Architecture

* **Frontend Layer:** React 18 · TypeScript · Vite · React Three Fiber (R3F) · Three.js
* **Backend Layer:** Express.js (Node.js) · SSE (Server-Sent Events)
* **Shared Layer:** Common Constants · Strict Type Interfaces · Pure Utility Functions
* **LLM Integration:** Google Official `@google/genai` SDK 
* **Data Storage:** MySQL Database 
* **Styling & Optimization:** CSS Modules*

---

## ✅ Integrated Feature Scope

Current `dev` integration includes:

* Gemini JSON analysis with MySQL-backed cache and persistent analysis fields
* SSE analysis streaming from backend to frontend
* R3F 3D emotion-space rendering with axis on/off projection controls
* HUD search form, stream progress log, and emotion-axis panel
* iTunes Search API metadata lookup for title, artist, album image, and track id
* Shareable 3D snapshot URLs with compact encoding and legacy decode support
* Hover metadata card, selected-track state, nearest/farthest relation highlights, and relation lines
* Automated contract tests for analysis, snapshot encoding, 5D mapping, and relation recomputation

Detailed PR notes: [`docs/dev-merge-pr.md`](docs/dev-merge-pr.md)

## 📋 Checklist Status

Implementation checklist `#2` through `#30` is completed in [`docs/checklist.md`](docs/checklist.md).

Validation commands:

```powershell
corepack pnpm run test
corepack pnpm run lint
corepack pnpm run server:build
corepack pnpm run build
```

---

# 👥 Author & License
- Author: 정현우 / jhu-01

- License: **[MIT](LICENSE)**
