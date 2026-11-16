# ⚡ Pulse Rush

### Run. Dodge. Jump. Dash. Survive.

**Pulse Rush** is a futuristic 3D obstacle-racing game built for the browser. Navigate through a neon-inspired track, avoid dangerous obstacles, jump across gaps, slide under barriers, and use your Pulse energy to dash through laser hazards.

This is an early playable prototype, and the project is being developed step by step.

---

## 🎮 Gameplay

- **3D Runner Experience** — Race through a futuristic environment with a third-person camera.
- **Dynamic Movement** — Steer, jump, slide, and dash to avoid obstacles.
- **Pulse Energy** — Use your energy to activate a temporary speed boost and pass through laser hazards.
- **Obstacle Challenges** — Dodge blocks, lasers, gates, sweepers, and gaps.
- **Difficulty Options** — Choose from the available difficulty settings.
- **Mobile Controls** — Touch controls designed for landscape gameplay.
- **Progress Tracking** — Your best score is saved locally.

## 🕹️ Controls

| Action | Keyboard |
|---|---|
| Move left / right | A / D or Arrow Keys |
| Jump | Space |
| Slide | Shift |
| Pulse Dash | E |
| Pause | Esc |

**Mobile:** Use the on-screen touch controls to steer, jump, slide, and dash.

## 🛠️ Built With

- **React** — User interface
- **TypeScript** — Application and simulation logic
- **Three.js** — 3D graphics and rendering
- **Vite** — Development server and build tool
- **Vitest** — Simulation unit tests

## 🚀 Run Locally

### Prerequisites

- Node.js
- npm
- A modern browser with WebGL support

### Installation

```bash
git clone https://github.com/saibhargava2552008/pulse-rush.git
cd pulse-rush
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL printed in your terminal.

### Run project checks

```bash
npm run lint
npm test
npm run build
```

## 📁 Project Structure

```text
pulse-rush/
├── src/
│   ├── engine/       # Three.js engine, camera, world and input
│   ├── simulation/   # Game rules, movement and obstacle logic
│   └── ui/           # React menus, HUD and touch controls
├── public/
├── package.json
├── vite.config.ts
└── README.md
```

## 🧪 Development Status

**Current milestone: M1 — First Playable Prototype**

The initial prototype includes the core runner experience, movement mechanics, obstacles, Pulse dash, user interface, and local best-score tracking.

### Local verification

| Check | Result |
|---|---|
| npm install | Passed |
| ESLint | Passed |
| Unit tests | 17/17 passed |
| TypeScript check | Passed |
| Production build | Passed |

*Visual polish, gameplay balancing, and real-device performance testing are still part of ongoing development.*

## 🗺️ What's Next?

Pulse Rush is planned to grow through future milestones:

- Improved graphics, environments, and animations
- More challenging levels and obstacle combinations
- Better gameplay balancing and progression
- Additional game modes
- Multiplayer experiments
- Achievements, leaderboards, and customization

These are future goals, not features currently available in M1.

## 👨‍💻 Developer

**Sai Bhargava Reddy**

- GitHub: [@saibhargava2552008](https://github.com/saibhargava2552008)

---

*Built with curiosity, creativity, and a passion for game development.*

**Pulse Rush — The race is just getting started.**