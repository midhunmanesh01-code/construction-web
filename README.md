# M & M Constructions — 3D Interactive Web Experience

<div align="center">

![M & M Constructions](react-app/src/assets/hero.png)

### *"From Foundation to Finish. Crafting spaces built to last."*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r186-black?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## 🏗️ Overview

**M & M Constructions** is a state-of-the-art interactive 3D web application designed to showcase high-end construction, architectural craft, and turnkey engineering. 

Unlike traditional static corporate websites, this experience utilizes a **scroll-driven 3D construction simulation**. As the visitor scrolls through the page, a full-scale building is procedurally erected in real time—from earthworks and rebar foundations to structural frames, glass envelopes, interior furnishings, lighting, and exterior landscape.

---

## ✨ Key Features

- **🏗️ Scroll-Driven 3D Construction Pipeline**
  - Continuous procedural assembly of structural columns, slabs, glass facade, interior fixtures, and crane mechanics synchronized to scroll position.
  - Multi-stage reveal modes (`y`, `x`, `z`, `pop`, `fade`, `out`) controlled by exact progression thresholds.

- **📐 Real-Time Blueprint & Wireframe Mode**
  - Dynamic material transformation into architectural blueprint lines with live dimension and structural annotation callouts projected directly from 3D space into 2D UI coordinates.

- **🎥 Cinematic Camera Spline System**
  - Smooth camera interpolation using `CatmullRomCurve3` splines that dynamically track focus points, orbit angles, and zoom distances per section (Site → Foundation → Structure → Envelope → Interiors → Finish).

- **💼 Interactive Services & Project Showcase**
  - Dedicated interactive service triggers that adapt camera perspective and building presentation in real time.
  - Interactive project catalog with smooth fullscreen modal overlay, detail views, and specification breakdowns.

- **⚡ High-Performance Decoupled Architecture**
  - WebGL rendering loop runs at 60 FPS via a shared mutable state bridge (`sceneState.ts`), eliminating React re-rendering overhead for real-time camera and vertex calculations.

- **🎯 Refined Industrial Aesthetics & Micro-Interactions**
  - Custom magnetic cursor, smooth parallax offsets, responsive typography (`Big Shoulders Display` & `Hanken Grotesk`), and mobile-friendly touch fallbacks.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) | Component lifecycle, UI state, overlays, and DOM binding |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type safety for project data, 3D parameters, and scene state |
| **3D Graphics** | [Three.js (v0.186)](https://threejs.org/) | WebGL rendering, lighting, shadows, camera splines, procedural textures |
| **Build Tooling** | [Vite](https://vitejs.dev/) | Instant HMR and optimized production bundling |
| **Styling** | Modern CSS Variables | Fast, zero-runtime styling with fluid typography and dark theme |

---

## 📁 Project Structure

```text
construction-web/
├── react-app/
│   ├── public/
│   ├── src/
│   │   ├── assets/              # Static assets, hero imagery, logos
│   │   ├── data/
│   │   │   └── content.ts       # Central editable business data (services, projects, contact, copy)
│   │   ├── three/
│   │   │   ├── sceneEngine.ts   # Core Three.js scene, geometry, lighting, materials, camera & dust particles
│   │   │   └── sceneState.ts    # High-performance 60fps shared mutable state bridge
│   │   ├── App.tsx              # Main React container, scroll logic, HUD, and section bindings
│   │   ├── index.css            # Global styling, keyframes, typography, and responsive rules
│   │   └── main.tsx             # Application entry point
│   ├── index.html               # HTML template with Google Fonts & meta configuration
│   ├── package.json             # NPM scripts and dependencies
│   ├── tsconfig.json            # TypeScript configuration
│   └── vite.config.ts           # Vite configuration
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** (or `yarn` / `pnpm`)

### Installation & Local Development

1. **Navigate into the application folder**:
   ```bash
   cd react-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and visit:
   ```text
   http://localhost:5173
   ```

### Production Build

To generate an optimized, minified production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## ⚙️ Content & Business Customization

All copy, contact details, service descriptions, and portfolio items can be configured in a single file without modifying 3D scene code:

👉 **[`react-app/src/data/content.ts`](file:///C:/Users/USER/OneDrive/Documents/Mini%20Projects/construction-web/react-app/src/data/content.ts)**

### What you can customize:
- **`about`**: Company founding history, mission, regional coverage.
- **`services`**: Service titles and detailed offerings.
- **`projects`**: Project names, locations, types, scope bullet points, and material specifications.
- **`principles`**: Core company values (Precision, Craftsmanship, Transparency, etc.).
- **`process`**: 6-step build methodology.
- **`contact`**: Phone numbers, WhatsApp integration, email, office location, and business hours.

---

## 🌐 Deployment

The application compiles to standard static files in `react-app/dist/` and can be hosted on any modern static hosting provider:

- **Vercel**: Run `vercel` or connect your Git repository (Root directory: `react-app`).
- **Netlify**: Set base directory to `react-app`, build command to `npm run build`, and publish directory to `react-app/dist`.
- **GitHub Pages / AWS S3 / Cloudflare Pages**: Deploy the contents of the `dist` folder.

---

## 📄 License & Ownership

© **M & M Constructions**. All rights reserved.  
Designed and engineered for modern construction and architectural excellence.
