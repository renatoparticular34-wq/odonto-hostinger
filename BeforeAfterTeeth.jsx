// BeforeAfterTeeth.jsx
// High-converting before/after teeth whitening reveal component.
// Tech: React + GSAP + ScrollTrigger. Vercel-ready.
//
// Install:
//   npm i gsap
//
// Usage:
//   import BeforeAfterTeeth from './BeforeAfterTeeth';
//   <BeforeAfterTeeth beforeSrc="/before.jpg" afterSrc="/after.jpg" />

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function BeforeAfterTeeth({
  beforeSrc = 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=900&q=85',
  afterSrc  = 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=900&q=85',
  className = '',
}) {
  const stageRef = useRef(null);
  const afterWrapRef = useRef(null);
  const dividerRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const afterWrap = afterWrapRef.current;
    const divider = dividerRef.current;
    if (!stage || !afterWrap || !divider) return;

    // shared state proxy — GSAP animates this object, we read in onUpdate
    const state = { reveal: 100, scale: 1 };

    const apply = () => {
      afterWrap.style.clipPath = `inset(0 ${state.reveal}% 0 0)`;
      divider.style.left = `calc(${100 - state.reveal}%)`;
      stage.style.transform = `scale(${state.scale})`;
    };
    apply();

    // 1) Initial auto reveal: 100% → 50%
    const intro = gsap.to(state, {
      reveal: 50,
      duration: 1.7,
      ease: 'power3.out',
      delay: 0.25,
      onUpdate: apply,
    });

    // 2) Scroll-controlled reveal: 50% → 0% + zoom 1 → 1.05
    const st = ScrollTrigger.create({
      trigger: stage,
      start: 'top 85%',
      end: 'bottom top',
      scrub: 0.8,
      onUpdate: (self) => {
        if (intro.progress() < 1) return; // wait for intro
        const p = self.progress;
        // easeInOutCubic
        const eased = p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p + 2, 3) / 2;
        state.reveal = 50 - 50 * eased;
        state.scale = 1 + 0.05 * eased;
        apply();
        // shine trigger
        if (state.reveal < 1.5) stage.classList.add('revealed');
        else stage.classList.remove('revealed');
      },
    });

    // reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      intro.progress(1); st.disable();
      state.reveal = 50; state.scale = 1; apply();
    }

    return () => { intro.kill(); st.kill(); };
  }, []);

  return (
    <div ref={stageRef} className={`ba-stage ${className}`}
         aria-label="Antes e depois: clareamento dental">
      <img className="ba-img ba-before" src={beforeSrc} alt="Dentes antes" draggable="false" />
      <div ref={afterWrapRef} className="ba-after-wrap">
        <img className="ba-img ba-after" src={afterSrc} alt="Dentes depois" draggable="false" />
      </div>
      <div ref={dividerRef} className="ba-divider">
        <div className="ba-handle" aria-hidden="true">⇆</div>
      </div>
      <span className="ba-label ba-label-before">Antes</span>
      <span className="ba-label ba-label-after">Depois</span>

      <style jsx>{`
        .ba-stage {
          position: relative;
          width: 100%;
          aspect-ratio: 4/5;
          border-radius: 24px;
          overflow: hidden;
          background: #0F172A;
          box-shadow:
            0 25px 50px -12px rgba(0,0,0,0.25),
            0 0 0 1px rgba(167,243,208,0.12),
            0 0 80px -20px rgba(16,185,129,0.35);
          transform-origin: center;
          will-change: transform;
        }
        .ba-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          user-select: none; -webkit-user-drag: none;
        }
        .ba-before {
          filter: sepia(0.55) saturate(1.55) brightness(0.88) contrast(0.95) hue-rotate(-8deg);
        }
        .ba-after-wrap {
          position: absolute; inset: 0;
          clip-path: inset(0 100% 0 0);
          will-change: clip-path;
        }
        .ba-after { filter: brightness(1.08) contrast(1.05) saturate(1.05); }

        .ba-divider {
          position: absolute; top: 0; bottom: 0;
          left: 0%;
          width: 2px;
          background: linear-gradient(180deg, transparent 0%, #fff 15%, #fff 85%, transparent 100%);
          box-shadow:
            0 0 12px 2px rgba(255,255,255,0.85),
            0 0 28px 4px rgba(167,243,208,0.6),
            0 0 60px 10px rgba(16,185,129,0.35);
          transform: translateX(-50%);
          pointer-events: none;
          z-index: 3;
          will-change: left;
        }
        .ba-handle {
          position: absolute; top: 50%; left: 50%;
          width: 48px; height: 48px; border-radius: 50%;
          background: #fff; color: #059669;
          transform: translate(-50%, -50%);
          display: grid; place-items: center;
          font-size: 20px; font-weight: 800;
          box-shadow:
            0 6px 24px rgba(0,0,0,0.35),
            0 0 0 1px rgba(0,0,0,0.04),
            inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .ba-label {
          position: absolute; bottom: 20px;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
          padding: 7px 14px;
          border-radius: 9999px;
          font-size: 11px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.12em;
          z-index: 4;
          box-shadow: 0 8px 24px -8px rgba(0,0,0,0.4);
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }
        .ba-label-before { left: 20px; background: rgba(15,23,42,0.65); }
        .ba-label-after  { right: 20px; background: rgba(16,185,129,0.85); border-color: rgba(167,243,208,0.5); }

        .ba-stage.revealed .ba-after-wrap::after {
          content: '';
          position: absolute; top: 0; bottom: 0;
          width: 60%; left: -60%;
          background: linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.38) 50%, transparent 65%);
          animation: baShine 1.6s cubic-bezier(.2,.6,.2,1) 1;
          pointer-events: none;
          mix-blend-mode: screen;
        }
        @keyframes baShine {
          0% { left: -60%; opacity: 0; }
          20% { opacity: 1; }
          100% { left: 140%; opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ba-stage { transform: none !important; }
        }
      `}</style>
    </div>
  );
}
