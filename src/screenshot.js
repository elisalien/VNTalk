import html2canvas from 'html2canvas';
import { getOutputFormat } from './renderer.js';
import { getState } from './state.js';
import { applyFXToCanvas, FX_OVERLAY_IDS } from './captureFX.js';

export async function capture() {
  const scene = document.getElementById('scene-container');
  if (!scene) return;

  const fmt = getOutputFormat();

  try {
    // Capture at native size — skip FX overlays (blend modes unsupported by html2canvas)
    const raw = await html2canvas(scene, {
      scale: 1,
      useCORS: true,
      backgroundColor: '#000',
      ignoreElements: (el) => FX_OVERLAY_IDS.includes(el.id),
    });

    // Create output canvas at target resolution
    const out = document.createElement('canvas');
    out.width = fmt.width;
    out.height = fmt.height;
    const ctx = out.getContext('2d');

    // Scale captured content to output dimensions
    ctx.drawImage(raw, 0, 0, fmt.width, fmt.height);

    // Apply FX effects as canvas post-processing
    applyFXToCanvas(ctx, fmt.width, fmt.height, getState());

    const link = document.createElement('a');
    link.download = `vntalk-${fmt.width}x${fmt.height}-${Date.now()}.png`;
    link.href = out.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('Screenshot failed:', err);
    alert('Erreur lors de la capture. Réessayez.');
  }
}
