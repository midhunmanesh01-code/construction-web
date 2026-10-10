# M & M CONSTRUCTIONS — Architectural Engineering & Luxury Residential Studio

<div align="center">

### *"Architecture · Craft · Detail — From Foundation to Finish"*

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Canvas 2D](https://img.shields.io/badge/Engine-HTML5_Canvas_60FPS-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![License](https://img.shields.io/badge/License-Proprietary-gold?style=for-the-badge)](license)

</div>

---

## 🏛️ Overview

**M & M Constructions** is a state-of-the-art interactive web platform for a premier residential construction and architectural engineering studio based in Kerala.

At the heart of the experience is an **Ultra-Performance 60 FPS Cinematic Frame Engine**. As visitors scroll through the site, a seamless 960-frame architectural walkthrough unfolds across the canvas, guiding users through site approach, spatial threshold, double-height interior volumes, cantilevered landscape terraces, and the signature finished residence.

---

## ✨ Key Features

### 🎞️ Ultra-Performance Cinematic Frame Engine
- **Scroll-Synchronized Scrubbing**: 960 high-resolution cinematic frames rendered via HTML5 Canvas with frame-rate independent exponential damping (`1 - exp(-9 * dt)`).
- **Asynchronous Worker Queue**: Multithreaded image decoding pipeline using native `createImageBitmap` and `fetch(..., { cache: 'force-cache' })` with worker concurrency limits (up to 8 parallel decodes).
- **Intelligent LRU Cache**: Dynamic memory management that prioritizes active frames, prunes distant buffers, and retains permanent keyframe grids.
- **Direction & Velocity Lookahead**: Predictive preloading that accelerates lookahead buffers according to user scroll velocity and direction.
- **Adaptive Mobile Mode**: Automatically detects mobile viewports, scales frame sampling to 480 frames, caps DPR at 1.5, and optimizes cache sizes for low memory footprints.

### 📐 Dynamic Architectural HUD
- **5 Progression Stages**:
  - `01 / 05 · EXTERIOR APPROACH` — Monolithic concrete cantilevers, teak louvers, and tropical landscaping.
  - `02 / 05 · THRESHOLD ENTRY` — Architectural portal transition into double-height volume.
  - `03 / 05 · INTERIOR VOLUME` — Double-height living pavilion, sculptural floating staircase, and continuous glass.
  - `04 / 05 · TERRACE LANDSCAPE` — Cantilevered upper lounge overlooking cascading greenery.
  - `05 / 05 · SIGNATURE RESIDENCE` — The finished contemporary residence in complete architectural balance.
- **Precision HUD Metrics**: Live journey percentage indicator, stage cards, technical corner crosshairs, and vignette framing.

### 💼 Comprehensive Architectural Showcase
- **Hero Overlay**: Opening statement with geographical coordinates (`09°58'12.4"N 76°17'34.8"E`), elevation datum, and quick navigation.
- **About Practice**: Studio ethos and 4 core engineering pillars (*Structural Rigor, Architectural Craft, Climate Responsive, Turnkey Reliability*).
- **Disciplines & Services**: 6 core disciplines (*Residential Construction, Architectural Execution, Renovation & Retrofitting, Interior Execution, Structural/Civil Works, Project Management*).
- **Portfolio of Works**: Selected luxury projects (*The Signature Residence, Basalt & Glass Pavilion, The Courtyard Villa, Hillside Cantilever House*) with interactive full-screen specification modal.
- **7-Step Build Methodology**: Complete turnkey build roadmap (*Vision → Planning → Foundation → Structure → Architecture → Detail → Completion*).
- **Direct Consultation & Floating Dock**: Dedicated contact form, office location, direct calling (`tel:`), and instant WhatsApp messaging (`wa.me`).

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | [React 18](https://react.dev/) | Declarative component UI and modal lifecycle |
| **Language** | [TypeScript 5.6](https://www.typescriptlang.org/) | Strict type definitions across all data and frame engine interfaces |
| **Rendering Engine** | HTML5 Canvas (`CanvasRenderingContext2D`) | High-performance 60 FPS frame playback with `ImageBitmap` decoding |
| **Build Tooling** | [Vite 6](https://vitejs.dev/) | Lightning-fast HMR and optimized production bundling |
| **Styling** | Modern CSS Variables | Zero-runtime CSS design system with custom grid, layout, and dark theme |
| **Typography** | Google Fonts | *Syne*, *Space Grotesk*, *Plus Jakarta Sans*, and *JetBrains Mono* |

---

## 📁 Project Structure

```text
construction-web/
├── react-app/
│   ├── public/
│   │   ├── frames/                  # High-resolution sequential JPG frames (frame-0001.jpg .. frame-0960.jpg)
│   │   └── favicon.svg              # Studio monogram favicon SVG
│   ├── src/
│   │   ├── components/              # Interactive UI components
│   │   │   ├── CinematicHud.tsx     # 5-stage progress HUD and live indicator
│   │   │   ├── CinematicSection.tsx # Sticky scroll viewport and canvas render loop
│   │   │   ├── FloatingActions.tsx  # Quick WhatsApp & Call floating action dock
│   │   │   ├── HeroOverlay.tsx      # Opening headline and studio coordinates
│   │   │   ├── MobileDrawer.tsx     # Mobile slide-out navigation menu
│   │   │   ├── Preloader.tsx        # Initial architectural loader with counter
│   │   │   ├── ProjectModal.tsx     # Fullscreen project specification viewer
│   │   │   └── SiteHeader.tsx       # Sticky site navigation header
│   │   ├── data/
│   │   │   └── content.ts           # Central business data (brand, services, projects, process, contact)
│   │   ├── lib/
│   │   │   └── frameEngine.ts       # Ultra-performance FrameCacheManager & LRU cache engine
│   │   ├── sections/                # Page sections
│   │   │   ├── AboutSection.tsx     # Studio history and engineering pillars
│   │   │   ├── ContactSection.tsx   # Contact form, direct details, location
│   │   │   ├── ProcessSection.tsx   # 7-step turnkey build methodology
│   │   │   ├── ProjectsSection.tsx  # Project portfolio grid
│   │   │   ├── ServicesSection.tsx  # 6 engineering disciplines
│   │   │   └── SiteFooter.tsx       # Studio footer and copyright
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript domain interfaces and types
│   │   ├── App.tsx                  # Main React container and section assembler
│   │   ├── index.css                # Global architectural design system & theme
│   │   └── main.tsx                 # React entry point
│   ├── index.html                   # HTML entry point with font preconnects
│   ├── package.json                 # NPM scripts & dependencies
│   ├── tsconfig.json                # TypeScript configuration
│   └── vite.config.ts               # Vite configuration
└── README.md                        # Master project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** (or `pnpm` / `yarn`)

### Installation & Local Development

1. **Navigate into the application directory**:
   ```bash
   cd react-app
   ```

2. **Install project dependencies**:
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

To compile a minified, type-checked production build:

```bash
npm run build
```

To locally preview the production build output:

```bash
npm run preview
```

---

## ⚙️ Configuration & Content Customization

### 1. Business Data & Content
All portfolio projects, service definitions, copy, process steps, phone numbers, and WhatsApp numbers are configured in a single file:

👉 **[`react-app/src/data/content.ts`](file:///C:/Users/USER/OneDrive/Documents/Mini%20Projects/construction-web/react-app/src/data/content.ts)**

Key sections you can modify:
- **`brand`**: Studio title, coordinates, elevation, status, and taglines.
- **`cinematic`**: Frame count, aspect ratio, frame base URL, and stage boundaries (`frameStart` / `frameEnd`).
- **`about`**: Headline, narrative copy, and 4 engineering pillars.
- **`services`**: 6 specialized service categories, deliverables, and focus areas.
- **`projects`**: Portfolio items, location, area, year, scope, highlights, and structural specs.
- **`process`**: 7-stage construction workflow and deliverables.
- **`contact`**: Phone numbers, WhatsApp contact, email, address, and studio hours.

### 2. Custom Frame CDN / Hosting (Optional)
If you host your 960-frame sequence on a separate CDN or S3 bucket, configure the following environment variables in a `.env` file in `react-app/`:

```env
# URL for desktop frames (defaults to /frames/frame-XXXX.jpg)
VITE_FRAME_BASE_URL=https://cdn.yourdomain.com/frames

# Optional dedicated mobile frame sequence URL
VITE_MOBILE_FRAME_BASE_URL=https://cdn.yourdomain.com/frames-mobile
```

---

## 🌐 Deployment

The application compiles into static files in `react-app/dist/` and can be deployed to any modern static hosting platform:

- **Vercel**: Set root directory to `react-app`, build command to `npm run build`, output directory to `dist`.
- **Netlify**: Set base directory to `react-app`, build command to `npm run build`, publish directory to `react-app/dist`.
- **Cloudflare Pages / AWS S3 / GitHub Pages**: Deploy the generated `react-app/dist` directory.

---

## 📄 License & Ownership

© **M & M Constructions**. All rights reserved.  
Architectural Engineering & Bespoke Luxury Residential Construction.
