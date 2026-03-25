import html2canvas from 'html2canvas';
import { getOutputFormat } from './renderer.js';

export async function capture() {
  const scene = document.getElementById('scene-container');
  if (!scene) return;

  const fmt = getOutputFormat();

  try {
    const canvas = await html2canvas(scene, {
      width: fmt.width,
      height: fmt.height,
      scale: 1,
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
