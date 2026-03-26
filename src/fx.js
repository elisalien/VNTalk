import { subscribe, getState } from './state.js';

let glitchInterval = null;
let grainCanvas = null;
let grainCtx = null;

export function initFX() {
  subscribe((state) => applyFX(state));
  applyFX(getState());
}

function applyFX(state) {
  const scene = document.getElementById('scene-container');
  const crt = document.getElementById('crt-overlay');
  const fxLayer = document.getElementById('fx-layer');
  if (!scene) return;

  // --- Scanlines ---
  if (crt) {
    if (state.crtEnabled && state.scanlineOpacity > 0) {
      crt.style.display = '';
      const d = state.scanlineDensity;
      const o = state.scanlineOpacity / 100;
      crt.style.background = `repeating-linear-gradient(
        to bottom,
        transparent 0px,
        transparent ${d}px,
        rgba(0,0,0,${o}) ${d}px,
        rgba(0,0,0,${o}) ${d * 2}px
      )`;
    } else {
      crt.style.display = 'none';
    }
  }

  // --- Vignette ---
  const vignette = document.getElementById('vignette-overlay');
  if (vignette) {
    if (state.vignetteIntensity > 0) {
      vignette.style.display = '';
      const v = state.vignetteIntensity / 100;
      vignette.style.background = `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${v}) 100%)`;
    } else {
      vignette.style.display = 'none';
    }
  }

  // --- Scene filters (color grading) ---
  const bgLayer = document.getElementById('background-layer');
  if (bgLayer) {
    const filters = [];
    if (state.brightness !== 100) filters.push(`brightness(${state.brightness}%)`);
    if (state.contrast !== 100) filters.push(`contrast(${state.contrast}%)`);
    if (state.saturation !== 100) filters.push(`saturate(${state.saturation}%)`);
    if (state.colorTemp !== 50) {
      const temp = state.colorTemp;
      if (temp > 50) filters.push(`sepia(${(temp - 50) * 1.2}%)`);
      else filters.push(`hue-rotate(${(50 - temp) * 1.5}deg)`);
    }
    if (state.bloom > 0) filters.push(`brightness(${100 + state.bloom * 0.3}%)`);
    if (state.pixelate > 0) {
      // CSS pixelation trick
      bgLayer.style.imageRendering = state.pixelate > 30 ? 'pixelated' : 'auto';
    } else {
      bgLayer.style.imageRendering = 'auto';
    }
    bgLayer.style.filter = filters.length ? filters.join(' ') : 'none';
  }

  // --- Chromatic Aberration ---
  const chromaticLayer = document.getElementById('chromatic-overlay');
  if (chromaticLayer) {
    if (state.chromaticAberration > 0) {
      const px = state.chromaticAberration;
      chromaticLayer.style.display = 'block';
      chromaticLayer.style.boxShadow = `
        inset ${px}px 0 0 rgba(255,0,0,0.1),
        inset -${px}px 0 0 rgba(0,0,255,0.1)
      `;
    } else {
      chromaticLayer.style.display = 'none';
    }
  }

  // --- Glitch ---
  if (state.glitchEnabled && state.glitchIntensity > 0) {
    startGlitch(state);
  } else {
    stopGlitch();
  }

  // --- Film Grain ---
  applyFilmGrain(state, fxLayer);

  // --- Bloom glow ---
  const bloomOverlay = document.getElementById('bloom-overlay');
  if (bloomOverlay) {
    if (state.bloom > 0) {
      bloomOverlay.style.display = 'block';
      const bloomFilter = `blur(${state.bloom * 0.5}px) brightness(${100 + state.bloom}%)`;
      bloomOverlay.style.backdropFilter = bloomFilter;
      bloomOverlay.style.webkitBackdropFilter = bloomFilter;
      bloomOverlay.style.opacity = state.bloom / 200;
    } else {
      bloomOverlay.style.display = 'none';
      bloomOverlay.style.backdropFilter = 'none';
      bloomOverlay.style.webkitBackdropFilter = 'none';
    }
  }
}

function startGlitch(state) {
  stopGlitch();
  const freq = Math.max(100, 5000 - state.glitchFrequency * 45);
  glitchInterval = setInterval(() => {
    const scene = document.getElementById('scene-container');
    if (!scene) return;
    const intensity = state.glitchIntensity;
    const x = (Math.random() - 0.5) * intensity * 0.2;
    const y = (Math.random() - 0.5) * intensity * 0.1;
    const skew = (Math.random() - 0.5) * intensity * 0.05;
    scene.style.transform = `translate(${x}px, ${y}px) skewX(${skew}deg)`;

    setTimeout(() => {
      if (scene) scene.style.transform = 'none';
    }, 50 + Math.random() * 80);
  }, freq);
}

function stopGlitch() {
  if (glitchInterval) {
    clearInterval(glitchInterval);
    glitchInterval = null;
  }
  const scene = document.getElementById('scene-container');
  if (scene) scene.style.transform = 'none';
}

function applyFilmGrain(state, fxLayer) {
  if (!fxLayer) return;
  if (state.filmGrain > 0) {
    if (!grainCanvas) {
      grainCanvas = document.createElement('canvas');
      grainCanvas.width = 256;
      grainCanvas.height = 256;
      grainCtx = grainCanvas.getContext('2d');
    }
    // Generate noise pattern
    const imageData = grainCtx.createImageData(256, 256);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = state.filmGrain * 1.5;
    }
    grainCtx.putImageData(imageData, 0, 0);
    fxLayer.style.display = 'block';
    fxLayer.style.backgroundImage = `url(${grainCanvas.toDataURL()})`;
    fxLayer.style.backgroundSize = '256px 256px';
    fxLayer.style.opacity = state.filmGrain / 100;

    // Animate grain
    if (!fxLayer.dataset.grainAnim) {
      fxLayer.dataset.grainAnim = 'true';
      let frame;
      const animateGrain = () => {
        const s = getState();
        if (s.filmGrain > 0) {
          const imgData = grainCtx.createImageData(256, 256);
          const dd = imgData.data;
          for (let i = 0; i < dd.length; i += 4) {
            const v = Math.random() * 255;
            dd[i] = dd[i + 1] = dd[i + 2] = v;
            dd[i + 3] = s.filmGrain * 1.5;
          }
          grainCtx.putImageData(imgData, 0, 0);
          fxLayer.style.backgroundImage = `url(${grainCanvas.toDataURL()})`;
          frame = requestAnimationFrame(animateGrain);
        } else {
          fxLayer.dataset.grainAnim = '';
        }
      };
      frame = requestAnimationFrame(animateGrain);
    }
  } else {
    fxLayer.style.display = 'none';
    fxLayer.dataset.grainAnim = '';
  }
}
