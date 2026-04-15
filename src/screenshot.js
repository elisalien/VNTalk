import html2canvas from 'html2canvas';
import { getOutputFormat } from './renderer.js';
import { getState } from './state.js';
import { applyFXToCanvas, FX_OVERLAY_IDS } from './captureFX.js';

export async function capture() {
  const scene = document.getElementById('scene-container');
  if (!scene) return;

  const fmt = getOutputFormat();

  // The scene's DOM dimensions are already the export dimensions
  // (fitSceneToWrapper keeps them in sync). We only need to strip the
  // preview transform and park the scene offscreen while html2canvas
  // snapshots it.
  const orig = {
    position: scene.style.position,
    left: scene.style.left,
    top: scene.style.top,
    zIndex: scene.style.zIndex,
    transform: scene.style.transform,
    marginRight: scene.style.marginRight,
    marginBottom: scene.style.marginBottom,
  };

  try {
    scene.style.position = 'fixed';
    scene.style.left = '-99999px';
    scene.style.top = '0';
    scene.style.zIndex = '-9999';
    scene.style.transform = 'none';
    scene.style.marginRight = '0';
    scene.style.marginBottom = '0';

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
    scene.style.zIndex = orig.zIndex;
    scene.style.transform = orig.transform;
    scene.style.marginRight = orig.marginRight;
    scene.style.marginBottom = orig.marginBottom;
  }
}
