import html2canvas from 'html2canvas';

export async function capture() {
  const scene = document.getElementById('scene-container');
  if (!scene) return;

  // Temporarily hide CRT overlay for cleaner capture (optional)
  const crt = document.getElementById('crt-overlay');
  const hadCrt = crt && crt.style.display !== 'none';

  try {
    const canvas = await html2canvas(scene, {
      width: 1920,
      height: 1080,
      scale: 1,
      useCORS: true,
      backgroundColor: '#000',
    });

    const link = document.createElement('a');
    link.download = 'vntalk-screenshot.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('Screenshot failed:', err);
    alert('Erreur lors de la capture. Réessayez.');
  }
}
