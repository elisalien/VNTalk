/**
 * Apply visual FX as canvas post-processing.
 * html2canvas does NOT support mix-blend-mode or backdrop-filter,
 * so CRT scanlines, vignette, film grain, chromatic aberration, and bloom
 * must be painted manually onto the exported canvas.
 */

export function applyFXToCanvas(ctx, w, h, state) {
  // --- Bloom glow (blur approximation via layered semi-transparent redraw) ---
  if (state.bloom > 0) {
    const bloomAlpha = Math.min(state.bloom / 400, 0.15);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = bloomAlpha;
    // Slight offset draws simulate bloom glow
    const offsets = [[-2, 0], [2, 0], [0, -2], [0, 2], [-1, -1], [1, 1]];
    for (const [dx, dy] of offsets) {
      ctx.drawImage(ctx.canvas, dx, dy);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  // --- Scanlines (CRT) ---
  if (state.crtEnabled && state.scanlineOpacity > 0) {
    const d = Math.max(1, Math.round(state.scanlineDensity * (h / 540)));
    const o = state.scanlineOpacity / 100;
    ctx.fillStyle = `rgba(0,0,0,${o})`;
    for (let y = d; y < h; y += d * 2) {
      ctx.fillRect(0, y, w, d);
    }
  }

  // --- Vignette ---
  if (state.vignetteIntensity > 0) {
    const v = state.vignetteIntensity / 100;
    const cx = w / 2;
    const cy = h / 2;
    const outerR = Math.sqrt(cx * cx + cy * cy);
    const gradient = ctx.createRadialGradient(cx, cy, outerR * 0.4, cx, cy, outerR);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${v})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  // --- Chromatic Aberration (channel-offset via colored overlay draws) ---
  if (state.chromaticAberration > 0) {
    const px = Math.round(state.chromaticAberration * (w / 960));
    if (px >= 1) {
      ctx.globalCompositeOperation = 'multiply';
      // Red tint shifted right
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = '#ff8080';
      ctx.fillRect(px, 0, w, h);
      // Blue tint shifted left
      ctx.fillStyle = '#8080ff';
      ctx.fillRect(-px, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
  }

  // --- Film Grain ---
  if (state.filmGrain > 0) {
    const grainSize = 256;
    const grainCanvas = document.createElement('canvas');
    grainCanvas.width = grainSize;
    grainCanvas.height = grainSize;
    const gCtx = grainCanvas.getContext('2d');
    const imgData = gCtx.createImageData(grainSize, grainSize);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = state.filmGrain * 1.5;
    }
    gCtx.putImageData(imgData, 0, 0);

    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = state.filmGrain / 100;
    for (let x = 0; x < w; x += grainSize) {
      for (let y = 0; y < h; y += grainSize) {
        ctx.drawImage(grainCanvas, x, y);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }
}

/** Element IDs that html2canvas cannot render (blend modes, backdrop-filter) */
export const FX_OVERLAY_IDS = ['crt-overlay', 'vignette-overlay', 'chromatic-overlay', 'bloom-overlay', 'fx-layer'];
