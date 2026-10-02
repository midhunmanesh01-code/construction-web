import { useEffect, useRef, useCallback, useState } from 'react';
import { createScene, type SceneEngine } from './three/sceneEngine';
import { sceneState } from './three/sceneState';
import { content } from './data/content';
import * as THREE from 'three';

// --- Utilities ---
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const STAGE_LABELS = ['SITE', 'FOUNDATION', 'STRUCTURE', 'ENVELOPE', 'INTERIORS', 'COMPLETE'];
const ANNOTATION_LABELS = ['STRUCTURE', 'MATERIAL', 'DIMENSIONS', 'DETAIL', 'EXECUTION'];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SceneEngine | null>(null);
  const pinRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const hlRef = useRef<HTMLSpanElement>(null);
  const hbRef = useRef<HTMLElement>(null);
  const bwRef = useRef<HTMLDivElement>(null);
  const curRef = useRef<HTMLDivElement>(null);
  const ovRef = useRef<HTMLDivElement>(null);
  const sdRef = useRef<HTMLParagraphElement>(null);
  const cdRef = useRef<HTMLDivElement>(null);
  const stRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const anRefs = useRef<(HTMLDivElement | null)[]>([]);
  const secRefs = useRef<(HTMLElement | null)[]>([]);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const serviceRowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const projectRowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const magRefs = useRef<(HTMLElement | null)[]>([]);

  const [overlayContent, setOverlayContent] = useState<{
    n: string; loc: string; type: string; d: string; scope: string[]; det: string;
  } | null>(null);

  // --- Initialize Three.js scene ---
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = createScene(canvasRef.current);
    engineRef.current = engine;

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // --- Trigger first service on mount ---
  useEffect(() => {
    const firstBtn = serviceRowRefs.current[0];
    if (firstBtn) {
      sceneState.svc = 0;
      serviceRowRefs.current.forEach((x) => x?.classList.toggle('on', x === firstBtn));
      if (sdRef.current) sdRef.current.textContent = content.services[0].description;
    }
  }, []);

  // --- UI animation loop (synced to rAF via the Three.js loop) ---
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const st = sceneState;
    let uiAnimId: number;
    const tmp = new THREE.Vector3();

    function uiFrame() {
      uiAnimId = requestAnimationFrame(uiFrame);

      const sy = window.scrollY;
      const vh = window.innerHeight;
      const pinEl = pinRef.current;
      if (!pinEl) return;

      const pinR = pinEl.offsetHeight - vh;
      const H = document.documentElement.scrollHeight - vh;
      const p = clamp(sy / pinR);
      const q = clamp((sy - pinR) / (H - pinR));

      st.p = p;
      st.q = q;

      // Find current visible section
      let cur: HTMLElement | null = null;
      for (const s of secRefs.current) {
        if (!s) continue;
        const r = s.getBoundingClientRect();
        if (r.top < vh * 0.5 && r.bottom > vh * 0.5) cur = s;
      }

      let tb = 0, tr = 1, ti = 0, pT = 1, lp = 0.5, tg = 1;

      if (sy < pinR + vh * 0.3 && q < 0.02) {
        pT = p;
      }

      const lpf = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return clamp((innerHeight - r.top) / (r.height + innerHeight));
      };

      if (cur) {
        tb = +(cur.dataset.bp || '0');
        tr = +(cur.dataset.rm || '1');
        ti = +(cur.dataset.in || '0');
        lp = lpf(cur);

        if (cur.id === 'process') {
          pT = clamp((lp - 0.25) / 0.5);
          tb = 1 - pT * 0.9;
        }
        if (cur.id === 'services') {
          tb = [0, 0, 0.55, 0, 1][st.svc];
          tg = [0.8, 1.55, 1, 1, 1][st.svc];
          if (st.svc === 3) {
            ti = 1;
            lp = 0.5 + Math.sin(st.time * 3e-4) * 0.3;
          }
        }
        if (cur.id === 'projects') {
          tr *= st.open ? 0.55 : 1 - st.hov * 0.2;
        }
      }

      // Smooth state transitions
      st.pe += (pT - st.pe) * 0.1;
      st.bp += (tb - st.bp) * 0.06;
      st.rm += (tr - st.rm) * 0.04;
      st.inK += (ti - st.inK) * 0.04;
      st.gy += (tg - st.gy) * 0.06;
      (st as any)._lp = lp;

      // Stage index
      let idx = 0;
      content.stages.forEach((s, i) => { if (p >= s.threshold) idx = i; });
      const inPin = q < 0.001 && sy < pinR + vh * 0.5;
      st.inPin = inPin;
      st.stageIdx = idx;

      // Update stage labels
      stRefs.current.forEach((e, i) => {
        if (e) e.classList.toggle('on', inPin && i === idx && p < 0.995);
      });

      if (idx !== st.lastIdx && bwRef.current) {
        bwRef.current.textContent = content.stages[idx].label;
        st.lastIdx = idx;
      }

      // Background watermark
      if (bwRef.current) bwRef.current.style.opacity = inPin && p < 0.99 ? '1' : '0';

      // Hero
      if (heroRef.current) {
        heroRef.current.style.opacity = p < 0.04 ? '1' : '0';
        heroRef.current.style.transform = `translateY(${-p * 400}px)`;
      }

      // Cue
      if (cueRef.current) cueRef.current.style.opacity = p < 0.02 ? '' : '0';

      // HUD
      if (hlRef.current) {
        hlRef.current.textContent = STAGE_LABELS[idx] + '  ' + Math.round(st.pe * 100) + '%';
      }
      if (hbRef.current) hbRef.current.style.width = st.pe * 100 + '%';
      if (hudRef.current) hudRef.current.style.opacity = sy < pinR ? '1' : '0';

      // Annotations — project 3D positions to 2D
      if (engine) {
        const cam = engine.getCamera();
        const G = engine.getGroup();
        const ap = engine.getAnnotationPositions();
        anRefs.current.forEach((e, i) => {
          if (!e) return;
          tmp.copy(ap[i]).applyMatrix4(G.matrixWorld).project(cam);
          e.style.opacity = tmp.z < 1 ? String(Math.max(0, st.bp - 0.15)) : '0';
          e.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * innerWidth}px,${(-tmp.y * 0.5 + 0.5) * innerHeight}px)`;
        });
      }

      // Process steps
      if (cur && cur.id === 'process') {
        stepRefs.current.forEach((e, i) => {
          if (e) e.classList.toggle('on', st.pe >= (i + 0.5) / 6 - 0.05);
        });
      }
    }

    uiAnimId = requestAnimationFrame(uiFrame);
    return () => cancelAnimationFrame(uiAnimId);
  }, []);

  // --- Pointer move handler ---
  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      sceneState.mx = e.clientX / innerWidth - 0.5;
      sceneState.my = e.clientY / innerHeight - 0.5;

      const c = curRef.current;
      if (c) {
        c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
        c.classList.toggle('h', !!(e.target as HTMLElement).closest('a,button'));
      }

      // Magnetic buttons
      magRefs.current.forEach((m) => {
        if (!m) return;
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        m.style.transform = Math.hypot(dx, dy) < 110
          ? `translate(${dx * 0.25}px,${dy * 0.25}px)`
          : '';
      });
    }

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // --- Escape key to close overlay ---
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeOverlay();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Service click handler ---
  const handleServiceClick = useCallback((index: number) => {
    sceneState.svc = index;
    serviceRowRefs.current.forEach((x, i) => {
      if (x) x.classList.toggle('on', i === index);
    });
    if (sdRef.current) sdRef.current.textContent = content.services[index].description;
  }, []);

  // --- Project handlers ---
  const handleProjectHover = useCallback((hovering: boolean) => {
    sceneState.hov = hovering ? 1 : 0;
  }, []);

  const handleProjectClick = useCallback((index: number) => {
    const p = content.projects[index];
    setOverlayContent(p);
    sceneState.open = true;
    if (ovRef.current) ovRef.current.classList.add('on');
    // Focus close button after render
    setTimeout(() => {
      const closeBtn = ovRef.current?.querySelector('#x') as HTMLElement;
      closeBtn?.focus();
    }, 50);
  }, []);

  const closeOverlay = useCallback(() => {
    if (ovRef.current) ovRef.current.classList.remove('on');
    sceneState.open = false;
    // Wait for transition, then clear content
    setTimeout(() => setOverlayContent(null), 700);
  }, []);

  // --- Contact expand ---
  const handleStartProject = useCallback(() => {
    if (cdRef.current) {
      cdRef.current.classList.add('on');
      cdRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, []);

  // Collect sec refs
  const addSecRef = useCallback((el: HTMLElement | null, id: string) => {
    // Store in array for iteration
    const idx = ['brand', 'about', 'services', 'projects', 'why', 'process', 'contact'].indexOf(id);
    if (idx >= 0) secRefs.current[idx] = el;
  }, []);

  return (
    <>
      {/* Veil */}
      <div id="veil" />

      {/* Custom cursor */}
      <div id="cur" ref={curRef} />

      {/* Background watermark */}
      <div id="bw" ref={bwRef} />

      {/* Nav */}
      <nav>
        <b>M &amp; M CONSTRUCTIONS</b>
        <div>
          <a href="#top">Experience</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      {/* Canvas */}
      <canvas id="c" ref={canvasRef} />

      {/* Main app content */}
      <div id="app">
        {/* Pin section */}
        <section id="pin" ref={pinRef}>
          <div className="fix" id="top">
            <div className="hero" id="hero" ref={heroRef}>
              <h1>M &amp; M<br />CONSTRUCTIONS</h1>
              <p>From Foundation to Finish.</p>
              <p>Crafting spaces built to last.</p>
            </div>
            <div className="cue" id="cue" ref={cueRef}>SCROLL TO BUILD ↓</div>
            {content.stages.map((s, i) => (
              <h2
                className="st"
                key={i}
                ref={(el) => { stRefs.current[i] = el; }}
              >
                {s.text}
              </h2>
            ))}
            <div id="hud" ref={hudRef}>
              <span id="hl" ref={hlRef} />
              <i><em id="hb" ref={hbRef} /></i>
            </div>
          </div>
        </section>

        {/* Annotations */}
        <div id="an">
          {ANNOTATION_LABELS.map((a, i) => (
            <div
              className="an"
              key={i}
              ref={(el) => { anRefs.current[i] = el; }}
            >
              {a}
            </div>
          ))}
        </div>

        {/* Brand section */}
        <section
          className="sec"
          id="brand"
          data-bp="1"
          data-rm="1"
          ref={(el) => addSecRef(el, 'brand')}
        >
          <p className="big">M &amp; M</p>
          <p className="big o">CONSTRUCTIONS</p>
        </section>

        {/* About section */}
        <section
          className="sec"
          id="about"
          data-bp=".2"
          data-rm=".72"
          ref={(el) => addSecRef(el, 'about')}
        >
          <h2>More Than<br />Concrete &amp; Steel.</h2>
          {content.about.map((a, i) => (
            <p key={i}>{a}</p>
          ))}
        </section>

        {/* Services section */}
        <section
          className="sec"
          id="services"
          data-bp="0"
          data-rm="1"
          ref={(el) => addSecRef(el, 'services')}
        >
          <div>
            {content.services.map((s, i) => (
              <button
                className="row"
                key={i}
                data-i={i}
                ref={(el) => { serviceRowRefs.current[i] = el; }}
                onMouseEnter={() => handleServiceClick(i)}
                onFocus={() => handleServiceClick(i)}
                onClick={() => handleServiceClick(i)}
              >
                {s.name}
              </button>
            ))}
          </div>
          <p id="sd" ref={sdRef} />
        </section>

        {/* Projects section */}
        <section
          className="sec"
          id="projects"
          data-bp="0"
          data-rm=".9"
          ref={(el) => addSecRef(el, 'projects')}
        >
          <div>
            {content.projects.map((p, i) => (
              <button
                className="row"
                key={i}
                data-i={i}
                ref={(el) => { projectRowRefs.current[i] = el; }}
                onMouseEnter={() => handleProjectHover(true)}
                onFocus={() => handleProjectHover(true)}
                onMouseLeave={() => handleProjectHover(false)}
                onBlur={() => handleProjectHover(false)}
                onClick={() => handleProjectClick(i)}
              >
                {p.n}
              </button>
            ))}
          </div>
          <p style={{ color: 'var(--st)', marginTop: '3vh' }}>
            Hover to move closer. Click to enter. Placeholder projects until real ones are supplied.
          </p>
        </section>

        {/* Why / Principles section */}
        <section
          id="why"
          data-bp="0"
          data-rm="1"
          data-in="1"
          style={{ position: 'relative', zIndex: 3, textShadow: '0 0 28px var(--bg)' }}
          ref={(el) => addSecRef(el, 'why')}
        >
          {content.principles.map((p, i) => (
            <div className="pr" key={i}>
              <b>{p.title}</b>
              <p style={{ maxWidth: '34ch' }}>{p.description}</p>
            </div>
          ))}
        </section>

        {/* Process section */}
        <section
          className="sec"
          id="process"
          data-bp="1"
          data-rm="1.05"
          style={{ minHeight: '140vh' }}
          ref={(el) => addSecRef(el, 'process')}
        >
          <h2>The Build</h2>
          {content.process.map((p, i) => (
            <div
              className="step"
              key={i}
              ref={(el) => { stepRefs.current[i] = el; }}
            >
              <b>0{i + 1}</b>
              <div>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Contact section */}
        <section
          className="sec"
          id="contact"
          data-bp="0"
          data-rm="1.8"
          style={{ textAlign: 'center', alignItems: 'center' }}
          ref={(el) => addSecRef(el, 'contact')}
        >
          <h2>Ready to Build?</h2>
          <p>Let's turn your vision into a space.</p>
          <div>
            <button
              className="btn p mag"
              id="go"
              onClick={handleStartProject}
              ref={(el) => { magRefs.current[0] = el; }}
            >
              START YOUR PROJECT
            </button>
            <a
              className="btn mag"
              id="wa"
              href={content.whatsappNumber ? `https://wa.me/${content.whatsappNumber}` : '#contact'}
              ref={(el) => { magRefs.current[1] = el; }}
            >
              WHATSAPP US
            </a>
          </div>
          <div id="cd" ref={cdRef}>
            {Object.entries(content.contact).map(([k, v]) => (
              <div key={k}>
                <span>{k.toUpperCase()}</span>
                {v}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer>
          <span>© M &amp; M Constructions</span>
          <span>From Foundation to Finish.</span>
        </footer>
      </div>

      {/* Project overlay */}
      <div id="ov" role="dialog" aria-label="Project" ref={ovRef}>
        {overlayContent && (
          <>
            <button
              id="x"
              className="btn"
              style={{ position: 'fixed', top: '14vh', right: '5vw' }}
              onClick={closeOverlay}
            >
              CLOSE
            </button>
            <h2>{overlayContent.n}</h2>
            <p>{overlayContent.loc} / {overlayContent.type}</p>
            <p>{overlayContent.d}</p>
            <div className="g">
              {['Hero visualization', 'Gallery 1', 'Gallery 2', 'Gallery 3'].map((g) => (
                <div key={g}>{g}</div>
              ))}
            </div>
            <h3>Scope</h3>
            <p dangerouslySetInnerHTML={{ __html: overlayContent.scope.join('<br>') }} />
            <h3>Construction details</h3>
            <p>{overlayContent.det}</p>
          </>
        )}
      </div>
    </>
  );
}
