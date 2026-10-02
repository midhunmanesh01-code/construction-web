import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { createScene, type SceneEngine } from './three/sceneEngine';
import { sceneState, type ViewMode, type LightingMode } from './three/sceneState';
import { content, type Project, type ArchitecturalSpace } from './data/content';

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SceneEngine | null>(null);
  
  // UI Element Refs
  const pinRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const stageCardRef = useRef<HTMLDivElement>(null);
  const scrubberProgressRef = useRef<HTMLDivElement>(null);
  const scrubberPercentRef = useRef<HTMLSpanElement>(null);
  const loadRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const telemetryElevRef = useRef<HTMLSpanElement>(null);
  const annotationRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Interactive UI State
  const [activeAngle, setActiveAngle] = useState<string>('frontLeft');
  const [activeLighting, setActiveLighting] = useState<LightingMode>('dusk');
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
  const [explodedVal, setExplodedVal] = useState<number>(0);
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Consultation Form State
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    location: '',
    plotArea: '',
    typology: 'Luxury Residential Villa',
    notes: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Initialize Three.js Scene Engine
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = createScene(canvasRef.current);
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Set Viewpoint Angle
  const handleSelectAngle = useCallback((viewId: string) => {
    setActiveAngle(viewId);
    setActiveSpaceId(null);
    if (engineRef.current) {
      engineRef.current.setViewMode(viewId as ViewMode);
    }
  }, []);

  // Set Lighting Mood
  const handleSelectLighting = useCallback((mode: LightingMode) => {
    setActiveLighting(mode);
    if (engineRef.current) {
      engineRef.current.setLightingMode(mode);
    }
  }, []);

  // Inspect Architectural Space
  const handleInspectSpace = useCallback((space: ArchitecturalSpace) => {
    if (activeSpaceId === space.id) {
      setActiveSpaceId(null);
      if (engineRef.current) {
        engineRef.current.inspectSpace(null);
      }
    } else {
      setActiveSpaceId(space.id);
      if (engineRef.current) {
        engineRef.current.inspectSpace(space.id);
      }
    }
  }, [activeSpaceId]);

  // Handle Exploded View Slider
  const handleExplodedChange = useCallback((val: number) => {
    setExplodedVal(val);
    if (engineRef.current) {
      engineRef.current.setExplodedBlend(val);
    }
  }, []);

  // Mouse & Pointer Tracking for 3D Parallax & Cursor
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      sceneState.mx = x;
      sceneState.my = y;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, []);

  // 60fps UI Loop for Scroll Tracking, 3D Annotations & HUD
  useEffect(() => {
    let animId: number;
    const tmpVec = new THREE.Vector3();

    const updateLoop = () => {
      animId = requestAnimationFrame(updateLoop);

      const st = sceneState;
      const sy = window.scrollY;
      const vh = window.innerHeight;

      // Calculate pin scroll progress
      let p = 0;
      let q = 0;
      const pinEl = pinRef.current;

      if (pinEl) {
        const pinHeight = pinEl.offsetHeight - vh;
        if (pinHeight > 0) {
          p = clamp(sy / pinHeight);
          if (sy > pinHeight) {
            q = (sy - pinHeight) / (document.documentElement.scrollHeight - pinEl.offsetHeight);
          }
        }
      }

      st.p = p;
      st.q = q;

      // When not in custom view mode, follow scroll progress
      if (st.viewMode === 'scroll') {
        st.pe += (p - st.pe) * 0.08;
      } else {
        st.pe += (p - st.pe) * 0.05;
      }

      // Determine current construction stage index
      let stageIdx = 0;
      content.stages.forEach((s, idx) => {
        if (st.pe >= s.threshold) stageIdx = idx;
      });
      if (stageIdx !== currentStageIdx) {
        setCurrentStageIdx(stageIdx);
        st.stageIdx = stageIdx;
      }

      // Update Hero Fade & Parallax
      if (heroRef.current) {
        const heroOpacity = clamp(1 - p * 8);
        heroRef.current.style.opacity = String(heroOpacity);
        heroRef.current.style.transform = `translateY(${-p * 350}px)`;
        heroRef.current.style.pointerEvents = heroOpacity > 0.05 ? 'auto' : 'none';
      }

      // Update Construction Stage Card & HUD
      const inPinSection = sy < (pinEl ? pinEl.offsetHeight - vh * 0.2 : vh * 8);
      if (stageCardRef.current) {
        const cardOpacity = inPinSection && p > 0.02 ? 1 : 0;
        stageCardRef.current.style.opacity = String(cardOpacity);
        stageCardRef.current.style.pointerEvents = cardOpacity > 0.5 ? 'auto' : 'none';
      }

      // Update Timeline Scrubber Bar
      const pct = Math.round(st.pe * 100);
      if (scrubberProgressRef.current) {
        scrubberProgressRef.current.style.width = `${pct}%`;
      }
      if (scrubberPercentRef.current) {
        scrubberPercentRef.current.textContent = `${pct}%`;
      }

      // Update Telemetry Elevation
      if (telemetryElevRef.current) {
        const elev = (st.pe * 7.6).toFixed(2);
        telemetryElevRef.current.textContent = `EL +${elev}m`;
      }

      // Update Loading Indicator
      if (loadRef.current) {
        loadRef.current.style.opacity = st.modelLoaded ? '0' : '1';
      }

      // Project 3D Annotation Anchors to 2D Screen
      if (engineRef.current) {
        const cam = engineRef.current.getCamera();
        const G = engineRef.current.getGroup();
        const positions = engineRef.current.getAnnotationPositions();

        annotationRefs.current.forEach((el, i) => {
          if (!el || !positions[i]) return;
          tmpVec.copy(positions[i]).applyMatrix4(G.matrixWorld).project(cam);

          // Visible when in front of camera and during completed construction/blueprint mode
          const isVisible = tmpVec.z < 1 && inPinSection && st.pe > 0.25;
          el.style.opacity = isVisible ? '0.9' : '0';
          el.style.transform = `translate(${(tmpVec.x * 0.5 + 0.5) * window.innerWidth}px, ${(-tmpVec.y * 0.5 + 0.5) * window.innerHeight}px)`;
        });
      }
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [currentStageIdx]);

  // Handle Scrubber Click
  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = clamp((e.clientX - rect.left) / rect.width);
    if (pinRef.current) {
      const pinHeight = pinRef.current.offsetHeight - window.innerHeight;
      window.scrollTo({ top: ratio * pinHeight, behavior: 'smooth' });
    }
  };

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    const msg = `Architectural Consultation Inquiry:\nName: ${formState.name}\nPhone: ${formState.phone}\nPlot Location: ${formState.location}\nPlot Area: ${formState.plotArea}\nTypology: ${formState.typology}\nNotes: ${formState.notes}`;
    const whatsappUrl = `https://wa.me/${content.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');
  };

  const currentStage = content.stages[currentStageIdx] || content.stages[0];

  return (
    <>
      {/* Cinematic Intro Veil */}
      <div id="veil" />

      {/* Atmospheric Drafting Grid */}
      <div id="bg-drafting-grid" />

      {/* 3D WebGL Canvas */}
      <canvas id="c" ref={canvasRef} />

      {/* Custom Drafting Crosshair Cursor */}
      <div id="drafting-cursor" ref={cursorRef} />

      {/* Model Loading Status Badge */}
      <div id="loadmsg" ref={loadRef}>
        <span>ARCHITECTURAL ASSET</span>
        <span className="ac">SCHEMATIC CAD MODE</span>
      </div>

      {/* Fixed Navigation & Presentation Header */}
      <header id="main-nav">
        <div className="brand-mark">
          <a href="#top" className="brand-monogram">
            M<span>&amp;</span>M
          </a>
          <div className="brand-tag">
            CONSTRUCTIONS<br />
            ARCHITECTURAL STUDIO
          </div>
        </div>

        {/* Viewpoint Angle Selector Ribbon (from reference image) */}
        <nav className="viewpoint-ribbon" aria-label="Architectural Viewpoints">
          {content.viewpoints.map((vp) => (
            <button
              key={vp.id}
              className={`view-btn ${activeAngle === vp.id ? 'active' : ''}`}
              onClick={() => handleSelectAngle(vp.id)}
              title={vp.description}
            >
              {vp.name}
            </button>
          ))}
        </nav>

        {/* Lighting Mode Controls & Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="lighting-controls">
            {(['dusk', 'golden', 'night', 'blueprint'] as LightingMode[]).map((mode) => (
              <button
                key={mode}
                className={`light-btn ${activeLighting === mode ? 'active' : ''}`}
                onClick={() => handleSelectLighting(mode)}
                title={`Switch to ${mode} lighting ambiance`}
              >
                {mode === 'dusk' && '🌇 Dusk'}
                {mode === 'golden' && '☀️ Golden'}
                {mode === 'night' && '🌙 Night'}
                {mode === 'blueprint' && '📐 CAD'}
              </button>
            ))}
          </div>

          <a href="#consultation" className="btn-inquire">
            Book Consultation
          </a>
        </div>
      </header>

      {/* Technical Telemetry HUD Overlay */}
      <div id="telemetry-hud">
        <div className="hud-item">
          <div className="dot" />
          <span>DATUM: {content.brand.coordinates}</span>
        </div>
        <div className="hud-item">
          <span ref={telemetryElevRef}>{content.brand.elevation}</span>
        </div>
        <div className="hud-item">
          <span>{content.brand.scale}</span>
        </div>
      </div>

      {/* 3D Floating Projector Annotations */}
      {['01. FOUNDATION & PLINTH', '02. STRUCTURAL COLUMNS', '03. CANTILEVER ROOF & LOUVERS', '04. DOUBLE-HEIGHT ATRIUM', '05. TROPICAL LANDSCAPE'].map((label, idx) => (
        <div
          key={label}
          className="annotation-anchor"
          ref={(el) => { annotationRefs.current[idx] = el; }}
        >
          <div className="annotation-card">
            <div className="dot" />
            <span>{label}</span>
          </div>
        </div>
      ))}

      {/* Main Application Container */}
      <main id="app">
        {/* =================================================================
            01. PINNED SCROLL CONSTRUCTION SEQUENCE (1000vh)
            ================================================================= */}
        <section id="pin" ref={pinRef}>
          <div className="fix-stage">
            {/* Hero Architectural Editorial Overlay */}
            <div className="hero-editorial" id="hero" ref={heroRef}>
              <div className="hero-top-meta">
                <span>{content.brand.coordinates}</span>
                <span>{content.brand.scale}</span>
              </div>

              <div className="hero-title-group">
                <span className="hero-eyebrow">SIGNATURE RESIDENTIAL ARCHITECTURE</span>
                <h1>{content.brand.name}</h1>
                <p className="hero-tagline">{content.brand.tagline}</p>
                <p className="hero-subtagline">{content.brand.subtagline}</p>
              </div>

              <div className="hero-bottom-bar">
                <div className="scroll-cue">
                  <div className="scroll-cue-arrow">↓</div>
                  <span>SCROLL TO COMMENCE PHYSICAL CONSTRUCTION</span>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
                  STAGE 01 — 10
                </div>
              </div>
            </div>

            {/* Live 10-Stage Construction Progress Card */}
            <div id="construction-hud" ref={stageCardRef}>
              <div className="stage-card">
                <div className="stage-card-header">
                  <span className="stage-card-num">STAGE {currentStage.num} / 10</span>
                  <span className="stage-card-sublabel">{currentStage.sublabel}</span>
                </div>

                <h2>{currentStage.label}</h2>
                <p className="stage-card-desc">{currentStage.description}</p>

                <div className="stage-specs-grid">
                  {currentStage.specs.map((spec) => (
                    <div key={spec.label} className="spec-item">
                      <span className="spec-label">{spec.label}</span>
                      <span className="spec-value">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Timeline Scrubber Bar */}
            <div id="construction-scrubber">
              <div className="scrubber-header">
                <span>CONSTRUCTION TIMELINE</span>
                <span className="scrubber-percent" ref={scrubberPercentRef}>0%</span>
              </div>

              <div className="scrubber-rail" onClick={handleScrubberClick}>
                <div className="scrubber-progress" ref={scrubberProgressRef} />
              </div>

              <div className="scrubber-ticks">
                <span>01 SITE</span>
                <span>05 WALLS</span>
                <span>10 COMPLETE</span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            02. ARCHITECTURAL SPACES EXPLORER (The Signature House Rooms)
            ================================================================= */}
        <section id="spaces" className="content-section">
          <div className="section-header">
            <span className="section-eyebrow">SPATIAL CHOREOGRAPHY</span>
            <h2 className="section-title">Architectural Spaces</h2>
            <p className="section-lead">
              Discover the curated interior volumes and expansive outdoor pavilions of the signature modern residence. Click any space to fly the camera directly into the room.
            </p>
          </div>

          <div className="spaces-grid">
            {content.spaces.map((space) => {
              const isSelected = activeSpaceId === space.id;
              return (
                <div
                  key={space.id}
                  className={`space-card ${isSelected ? 'active' : ''}`}
                  onClick={() => handleInspectSpace(space)}
                >
                  <div>
                    <div className="space-card-top">
                      <span className="space-card-level">{space.level}</span>
                      <span className="space-card-area">{space.area}</span>
                    </div>
                    <h3>{space.name}</h3>
                    <div className="space-card-subtitle">{space.subtitle}</div>
                    <p>{space.description}</p>
                  </div>

                  <div>
                    <ul className="space-features-list">
                      {space.features.map((feat) => (
                        <li key={feat}>{feat}</li>
                      ))}
                    </ul>

                    <div className="btn-inspect-space">
                      <span>{isSelected ? '● RESET VIEW' : '▶ FLY CAMERA TO SPACE'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =================================================================
            03. EXPLODED AXONOMETRIC VIEW SYSTEM
            ================================================================= */}
        <section id="exploded" className="content-section">
          <div className="section-header">
            <span className="section-eyebrow">AXONOMETRIC DISASSEMBLY</span>
            <h2 className="section-title">Exploded Architectural System</h2>
            <p className="section-lead">
              Deconstruct the residence into its constituent engineering systems — from subterranean foundation footings up to the floating cantilevered solar canopy.
            </p>
          </div>

          <div className="exploded-view-container">
            {/* Interactive Slider Controller */}
            <div className="exploded-control-box">
              <span className="section-eyebrow">LAYER SEPARATION CONTROLLER</span>
              <h3 style={{ fontFamily: 'var(--d)', fontSize: '24px', margin: '8px 0 16px' }}>
                Spatial System Disassembly
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-dim)', marginBottom: '24px' }}>
                Drag the interactive slider below to vertically separate the house into its 7 primary architectural layers in real-time 3D.
              </p>

              <div className="exploded-slider-wrapper">
                <div className="exploded-slider-header">
                  <span>VERTICAL DISPLACEMENT</span>
                  <span className="val">{Math.round(explodedVal * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodedVal}
                  onChange={(e) => handleExplodedChange(parseFloat(e.target.value))}
                  className="exploded-slider"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn-inquire"
                  onClick={() => handleExplodedChange(0)}
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Assemble (0%)
                </button>
                <button
                  className="btn-inquire"
                  onClick={() => handleExplodedChange(1)}
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Explode (100%)
                </button>
              </div>
            </div>

            {/* Layer Stack Breakdown Cards */}
            <div className="layer-stack-list">
              {content.explodedLayers.map((layer) => (
                <div key={layer.id} className="layer-stack-item">
                  <div className="layer-stack-num">{layer.num}</div>
                  <div className="layer-stack-title">{layer.title}</div>
                  <div className="layer-stack-system">{layer.system}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================================
            04. MATERIALITY & FINISHES PALETTE
            ================================================================= */}
        <section id="materials" className="content-section">
          <div className="section-header">
            <span className="section-eyebrow">TACTILE PALETTE</span>
            <h2 className="section-title">Materials &amp; Engineering</h2>
            <p className="section-lead">
              A curated harmony of raw architectural concrete, warm kiln-dried teak wood louvers, honed dark basalt ashlar, and high-transmission acoustic thermal glazing.
            </p>
          </div>

          <div className="materials-grid">
            {content.materials.map((mat) => (
              <div key={mat.name} className="material-card">
                <div className="material-swatch-bar" style={{ background: mat.hex }} />
                <div className="material-card-cat">{mat.category}</div>
                <h4>{mat.name}</h4>
                <div className="material-card-finish">{mat.finish}</div>
                <p>{mat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================================
            05. ARCHITECTURAL DISCIPLINES & SERVICES
            ================================================================= */}
        <section id="services" className="content-section">
          <div className="section-header">
            <span className="section-eyebrow">EXECUTION CAPABILITIES</span>
            <h2 className="section-title">Services &amp; Disciplines</h2>
            <p className="section-lead">
              From subterranean geotechnical engineering to bespoke interior joinery, we execute complex luxury residences with absolute structural precision.
            </p>
          </div>

          <div className="services-stack">
            {content.services.map((svc) => (
              <div key={svc.id} className="service-row-item">
                <div className="service-num">{svc.number}</div>
                <div className="service-name">
                  <h3>{svc.name}</h3>
                  <div className="service-discipline">{svc.discipline}</div>
                </div>
                <div className="service-desc">{svc.description}</div>
                <div className="service-focus">{svc.focus}</div>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================================
            06. MONOGRAPH CASE STUDIES / SIGNATURE PROJECTS
            ================================================================= */}
        <section id="projects" className="content-section">
          <div className="section-header">
            <span className="section-eyebrow">BUILT MONOGRAPHS</span>
            <h2 className="section-title">Selected Case Studies</h2>
            <p className="section-lead">
              Explore bespoke residential commissions engineered and crafted to zero-tolerance architectural standards.
            </p>
          </div>

          <div className="projects-showcase">
            {content.projects.map((proj) => (
              <div
                key={proj.id}
                className="project-plate-card"
                onClick={() => setSelectedProject(proj)}
              >
                <div>
                  <div className="plate-header">
                    <span className="plate-year">{proj.year}</span>
                    <span className="plate-loc">{proj.loc}</span>
                  </div>
                  <h3>{proj.n}</h3>
                  <div className="plate-type">{proj.type} · {proj.area}</div>
                  <p>{proj.d}</p>
                </div>

                <div>
                  <div className="plate-specs-list">
                    {proj.specs.map((sp) => (
                      <div key={sp.key} className="spec-item">
                        <span className="spec-label">{sp.key}</span>
                        <span className="spec-value">{sp.val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="btn-inspect-space">
                    <span>VIEW ARCHITECTURAL SPECIFICATION ↗</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================================
            07. ARCHITECTURAL CONSULTATION / STUDIO DESK
            ================================================================= */}
        <section id="consultation" className="content-section">
          <div className="section-header">
            <span className="section-eyebrow">COMMENCE YOUR PROJECT</span>
            <h2 className="section-title">Studio Consultation</h2>
            <p className="section-lead">
              Initiate an architectural and structural engineering consultation for your upcoming residential or commercial commission.
            </p>
          </div>

          <div className="consultation-container">
            {/* Studio Info Card */}
            <div className="studio-info-card">
              <div>
                <span className="section-eyebrow">STUDIO DESK</span>
                <h3 style={{ fontFamily: 'var(--d)', fontSize: '28px', color: 'var(--w)', margin: '8px 0' }}>
                  {content.brand.name}
                </h3>
                <p style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--ac)' }}>
                  "{content.brand.tagline}"
                </p>

                <div className="studio-meta-list">
                  <div className="meta-row">
                    <span className="meta-key">LOCATION</span>
                    <span className="meta-val">{content.contact.Location}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-key">DIRECT INQUIRIES</span>
                    <span className="meta-val">{content.contact.Email}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-key">WORKING HOURS</span>
                    <span className="meta-val">{content.contact.WorkingHours}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-key">APPOINTMENT PROTOCOL</span>
                    <span className="meta-val">By Architectural Registration</span>
                  </div>
                </div>
              </div>

              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                DATUM: {content.brand.coordinates}
              </div>
            </div>

            {/* Consultation Inquiry Form */}
            <div className="consultation-form-card">
              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Client / Principal Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label htmlFor="phone">Contact Number / WhatsApp</label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+91 Phone"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="location">Site Location / City</label>
                    <input
                      id="location"
                      type="text"
                      required
                      placeholder="e.g. Kochi, Kerala"
                      value={formState.location}
                      onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label htmlFor="plotArea">Estimated Built Area</label>
                    <input
                      id="plotArea"
                      type="text"
                      placeholder="e.g. 5,500 Sq. Ft."
                      value={formState.plotArea}
                      onChange={(e) => setFormState({ ...formState, plotArea: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="typology">Project Typology</label>
                    <select
                      id="typology"
                      value={formState.typology}
                      onChange={(e) => setFormState({ ...formState, typology: e.target.value })}
                      className="form-select"
                    >
                      <option>Luxury Residential Villa</option>
                      <option>Modern Tropical Estate</option>
                      <option>Commercial / Office Facility</option>
                      <option>Architectural Renovation</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Project Vision &amp; Requirements</label>
                  <textarea
                    id="notes"
                    rows={3}
                    placeholder="Describe your site, desired timeline, or architectural preferences..."
                    value={formState.notes}
                    onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <button type="submit" className="btn-submit-inquiry">
                  {formSubmitted ? 'TRANSMITTING VIA WHATSAPP...' : 'TRANSMIT ARCHITECTURAL INQUIRY ↗'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Project Detail Modal Overlay */}
      {selectedProject && (
        <div id="project-modal" className="active">
          <button
            className="modal-close-btn"
            onClick={() => setSelectedProject(null)}
          >
            ✕ CLOSE SPECIFICATION
          </button>

          <div className="modal-content-wrap">
            <span className="section-eyebrow">ARCHITECTURAL MONOGRAPH</span>
            <h2 style={{ fontFamily: 'var(--d)', fontSize: '42px', color: 'var(--w)', margin: '8px 0' }}>
              {selectedProject.n}
            </h2>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ac)', marginBottom: '24px' }}>
              {selectedProject.type} · {selectedProject.loc} · {selectedProject.area} ({selectedProject.year})
            </div>

            <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'var(--text-dim)', marginBottom: '32px' }}>
              {selectedProject.d}
            </p>

            <div style={{ background: 'var(--bg-card)', padding: '24px', border: '1px solid var(--border)', marginBottom: '32px' }}>
              <span className="section-eyebrow">CONSTRUCTION METHODOLOGY</span>
              <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--w)', marginTop: '8px' }}>
                {selectedProject.det}
              </p>
            </div>

            <span className="section-eyebrow">EXECUTION SCOPE</span>
            <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
              {selectedProject.scope.map((item) => (
                <li key={item} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '2px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--w)' }}>
                  ✓ {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Architectural Footer */}
      <footer id="main-footer">
        <div>
          © {new Date().getFullYear()} {content.brand.name} — ALL RIGHTS RESERVED.
        </div>
        <div className="footer-right">
          <span>{content.brand.tagline}</span>
          <span>{content.brand.coordinates}</span>
        </div>
      </footer>
    </>
  );
}
