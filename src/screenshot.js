import html2canvas from 'html2canvas';
import { getOutputFormat } from './renderer.js';

export async function capture() {
  const scene = document.getElementById('scene-container');
  if (!scene) return;

  const fmt = getOutputFormat();

  try {
    // Calculate scale factor based on actual element size vs target output size
    const scaleX = fmt.width / scene.offsetWidth;
    const scaleY = fmt.height / scene.offsetHeight;
    const scale = Math.min(scaleX, scaleY);

    const canvas = await html2canvas(scene, {
      scale: scale,
      useCORS: true,
      backgroundColor: '#000',
    });

    const link = document.createElement('a');
    link.download = `vntalk-${fmt.width}x${fmt.height}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('Screenshot failed:', err);
    alert('Erreur lors de la capture. Réessayez.');
  }
}
