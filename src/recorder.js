import { getOutputFormat } from './renderer.js';

let mediaRecorder = null;
let recordedChunks = [];
let animFrameId = null;
let captureCanvas = null;
let captureCtx = null;
let captureStream = null;

const statusEl = () => document.getElementById('record-status');

export function isRecording() {
  return mediaRecorder && mediaRecorder.state === 'recording';
}

export function startRecording() {
  const scene = document.getElementById('scene-container');
  if (!scene) return;

  const fmt = getOutputFormat();

  // Create an offscreen canvas matching the output format
  captureCanvas = document.createElement('canvas');
  captureCanvas.width = fmt.width;
  captureCanvas.height = fmt.height;
  captureCtx = captureCanvas.getContext('2d');

  // Get a stream from the canvas
  captureStream = captureCanvas.captureStream(30); // 30 fps

  // Determine best supported format
  const mimeType = getSupportedMimeType();

  recordedChunks = [];
  mediaRecorder = new MediaRecorder(captureStream, {
    mimeType,
    videoBitsPerSecond: 5000000,
  });

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  mediaRecorder.onstop = () => {
    cancelAnimationFrame(animFrameId);
    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const blob = new Blob(recordedChunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `vntalk-${fmt.width}x${fmt.height}-${Date.now()}.${ext}`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('');
  };

  mediaRecorder.start(100); // collect data every 100ms

  // Start drawing the scene to the canvas each frame
  drawFrame(scene, fmt);
  setStatus('Enregistrement en cours...');
}

export function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
    setStatus('Traitement...');
  }
}

function drawFrame(scene, fmt) {
  // Use html2canvas-like approach but simpler: draw the DOM element via a foreign object
  // For performance, we use a simpler approach: capture the rendered scene via drawImage on a temp canvas

  const render = () => {
    try {
      // Get the scene's bounding rect for scaling
      const rect = scene.getBoundingClientRect();
      const scaleX = fmt.width / rect.width;
      const scaleY = fmt.height / rect.height;

      // We use the experimental API if available, else fallback to rasterizing
      if (typeof scene.offsetWidth !== 'undefined') {
        // Create a SVG foreignObject to render DOM to canvas
        const data = new XMLSerializer().serializeToString(scene);
        const svgStr = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${fmt.width}" height="${fmt.height}">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml" style="transform: scale(${scaleX}, ${scaleY}); transform-origin: top left; width: ${rect.width}px; height: ${rect.height}px;">
                ${scene.outerHTML}
              </div>
            </foreignObject>
          </svg>`;

        // For a reliable approach, capture video elements and images separately
        // Fallback: use a simpler rasterization with canvas drawImage from video/images
        rasterizeScene(scene, fmt);
      }
    } catch (e) {
      // Silent fail, continue recording
    }
    animFrameId = requestAnimationFrame(render);
  };

  render();
}

function rasterizeScene(scene, fmt) {
  const ctx = captureCtx;
  const rect = scene.getBoundingClientRect();
  const scaleX = fmt.width / rect.width;
  const scaleY = fmt.height / rect.height;

  // Clear
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, fmt.width, fmt.height);

  // Draw background
  const bgEl = scene.querySelector('#background-layer img, #background-layer video');
  if (bgEl) {
    try {
      ctx.drawImage(bgEl, 0, 0, fmt.width, fmt.height);
    } catch (e) { /* cross-origin */ }
  }

  // Apply color grading filters if any
  // (simplified — filters are CSS-only, so for video export we apply basic ones)

  // Draw character
  const charImg = scene.querySelector('#character-layer img');
  if (charImg && charImg.complete && charImg.naturalWidth > 0) {
    const charLayer = scene.querySelector('#character-layer');
    if (charLayer) {
      const charRect = charLayer.getBoundingClientRect();
      const imgRect = charImg.getBoundingClientRect();
      const dx = (imgRect.left - rect.left) * scaleX;
      const dy = (imgRect.top - rect.top) * scaleY;
      const dw = imgRect.width * scaleX;
      const dh = imgRect.height * scaleY;
      try {
        ctx.drawImage(charImg, dx, dy, dw, dh);
      } catch (e) { /* cross-origin */ }
    }
  }

  // Draw dialogue box
  const box = scene.querySelector('#dialogue-box');
  if (box && box.style.display !== 'none') {
    const boxRect = box.getBoundingClientRect();
    const bx = (boxRect.left - rect.left) * scaleX;
    const by = (boxRect.top - rect.top) * scaleY;
    const bw = boxRect.width * scaleX;
    const bh = boxRect.height * scaleY;

    // Box background
    const boxStyle = getComputedStyle(box);
    ctx.fillStyle = boxStyle.backgroundColor || 'rgba(0,0,10,0.85)';
    ctx.fillRect(bx, by, bw, bh);

    // Box border
    ctx.strokeStyle = boxStyle.borderTopColor || '#5b8dd9';
    ctx.lineWidth = 3 * scaleX;
    ctx.strokeRect(bx, by, bw, bh);

    // Name
    const nameEl = box.querySelector('#dialogue-name');
    if (nameEl && nameEl.textContent) {
      const nameStyle = getComputedStyle(nameEl);
      const nameFontSize = parseFloat(nameStyle.fontSize) * scaleX;
      ctx.font = `${nameFontSize}px ${nameStyle.fontFamily}`;
      ctx.fillStyle = nameStyle.color || '#5b8dd9';
      ctx.fillText(nameEl.textContent, bx + 16 * scaleX, by + nameFontSize + 10 * scaleY);
    }

    // Text
    const textEl = box.querySelector('#dialogue-text');
    if (textEl && textEl.textContent) {
      const textStyle = getComputedStyle(textEl);
      const textFontSize = parseFloat(textStyle.fontSize) * scaleX;
      ctx.font = `${textFontSize}px ${textStyle.fontFamily}`;
      ctx.fillStyle = textStyle.color || '#ffffff';

      // Word wrap
      const maxWidth = bw - 32 * scaleX;
      const lineHeightPx = textFontSize * 1.8;
      const words = textEl.textContent.split(' ');
      let line = '';
      let textY = by + (nameEl && nameEl.textContent ? 2.5 : 1.5) * textFontSize + 10 * scaleY;

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line) {
          ctx.fillText(line, bx + 16 * scaleX, textY);
          line = word;
          textY += lineHeightPx;
        } else {
          line = testLine;
        }
      }
      if (line) {
        ctx.fillText(line, bx + 16 * scaleX, textY);
      }
    }
  }

  // Draw scanline overlay (simplified)
  // Vignette
  const vignetteGrad = ctx.createRadialGradient(
    fmt.width / 2, fmt.height / 2, fmt.width * 0.3,
    fmt.width / 2, fmt.height / 2, fmt.width * 0.7
  );
  vignetteGrad.addColorStop(0, 'transparent');
  vignetteGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = vignetteGrad;
  ctx.fillRect(0, 0, fmt.width, fmt.height);
}

function getSupportedMimeType() {
  const types = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return 'video/webm';
}

function setStatus(text) {
  const el = statusEl();
  if (el) el.textContent = text;
}
