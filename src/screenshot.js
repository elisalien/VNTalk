import html2canvas from 'html2canvas';
import { getOutputFormat } from './renderer.js';
import { getState } from './state.js';
import { applyFXToCanvas, FX_OVERLAY_IDS } from './captureFX.js';

export async function capture() {
  const scene = document.getElementById('scene-container');
  if (!scene) return;

  const fmt = getOutputFormat();

  // Save original styles
  const orig = {
    position: scene.style.position,
    left: scene.style.left,
    top: scene.style.top,
    width: scene.style.width,
    maxWidth: scene.style.maxWidth,
    maxHeight: scene.style.maxHeight,
    zIndex: scene.style.zIndex,
  };

  try {
    // Temporarily resize scene to exact output dimensions offscreen
    // so all %, transforms, vw units resolve at the correct pixel sizes
    scene.style.position = 'fixed';
    scene.style.left = '-99999px';
    scene.style.top = '0';
    scene.style.width = fmt.width + 'px';
    scene.style.maxWidth = fmt.width + 'px';
    scene.style.maxHeight = 'none';
    scene.style.zIndex = '-9999';

    // Force reflow
    scene.offsetHeight;

    const canvas = await html2canvas(scene, {
      scale: 1,
      width: fmt.width,
      height: fmt.height,
      useCORS: true,
      backgroundColor: '#000',
      ignoreElements: (el) => FX_OVERLAY_IDS.includes(el.id),
    });

    // Apply FX post-processing
    const ctx = canvas.getContext('2d');
    applyFXToCanvas(ctx, fmt.width, fmt.height, getState());

    const link = document.createElement('a');
    link.download = `vntalk-${fmt.width}x${fmt.height}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('Screenshot failed:', err);
    alert('Erreur lors de la capture. Réessayez.');
  } finally {
    // Always restore original styles
    scene.style.position = orig.position;
    scene.style.left = orig.left;
    scene.style.top = orig.top;
    scene.style.width = orig.width;
    scene.style.maxWidth = orig.maxWidth;
    scene.style.maxHeight = orig.maxHeight;
    scene.style.zIndex = orig.zIndex;
  }
}
