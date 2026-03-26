import html2canvas from 'html2canvas';
import { getOutputFormat } from './renderer.js';
import { getState } from './state.js';
import { applyFXToCanvas, FX_OVERLAY_IDS } from './captureFX.js';

let mediaRecorder = null;
let recordedChunks = [];
let recording = false;
let captureCanvas = null;
let captureCtx = null;
let captureStream = null;
let origSceneStyles = null;

const statusEl = () => document.getElementById('record-status');

export function isRecording() {
  return recording;
}

/**
 * Move the scene container offscreen at exact output dimensions so that
 * html2canvas captures pixel-perfect layout (all %, transforms, vw units
 * resolve correctly at 1080×1920 etc.).
 */
function expandSceneForCapture(scene, fmt) {
  origSceneStyles = {
    position: scene.style.position,
    left: scene.style.left,
    top: scene.style.top,
    width: scene.style.width,
    maxWidth: scene.style.maxWidth,
    maxHeight: scene.style.maxHeight,
    zIndex: scene.style.zIndex,
    visibility: scene.style.visibility,
  };

  scene.style.position = 'fixed';
  scene.style.left = '-99999px';
  scene.style.top = '0';
  scene.style.width = fmt.width + 'px';
  scene.style.maxWidth = fmt.width + 'px';
  scene.style.maxHeight = 'none';
  scene.style.zIndex = '-9999';
  scene.style.visibility = 'visible';

  // Force reflow so the browser computes the new layout
  scene.offsetHeight;
}

function restoreScene(scene) {
  if (!origSceneStyles) return;
  scene.style.position = origSceneStyles.position;
  scene.style.left = origSceneStyles.left;
  scene.style.top = origSceneStyles.top;
  scene.style.width = origSceneStyles.width;
  scene.style.maxWidth = origSceneStyles.maxWidth;
  scene.style.maxHeight = origSceneStyles.maxHeight;
  scene.style.zIndex = origSceneStyles.zIndex;
  scene.style.visibility = origSceneStyles.visibility;
  origSceneStyles = null;
}

export function startRecording() {
  const scene = document.getElementById('scene-container');
  if (!scene) return;

  const fmt = getOutputFormat();

  // Move scene offscreen at output dimensions
  expandSceneForCapture(scene, fmt);

  // Create the recording canvas
  captureCanvas = document.createElement('canvas');
  captureCanvas.width = fmt.width;
  captureCanvas.height = fmt.height;
  captureCtx = captureCanvas.getContext('2d');

  // Get a stream from the canvas
  captureStream = captureCanvas.captureStream(30);

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
    recording = false;
    // Restore scene to original size
    restoreScene(scene);

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

  mediaRecorder.start(100);
  recording = true;

  // Start the capture loop
  captureLoop(scene, fmt);
  setStatus('Enregistrement en cours...');
}

export function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    recording = false;
    mediaRecorder.stop();
    setStatus('Traitement...');
  }
}

async function captureLoop(scene, fmt) {
  if (!recording) return;

  try {
    // Scene is already at output dimensions (offscreen) — capture at scale 1
    const canvas = await html2canvas(scene, {
      scale: 1,
      width: fmt.width,
      height: fmt.height,
      useCORS: true,
      backgroundColor: '#000',
      ignoreElements: (el) => FX_OVERLAY_IDS.includes(el.id),
    });

    if (!recording) return;

    captureCtx.clearRect(0, 0, fmt.width, fmt.height);
    captureCtx.drawImage(canvas, 0, 0, fmt.width, fmt.height);

    // Apply FX effects as canvas post-processing
    applyFXToCanvas(captureCtx, fmt.width, fmt.height, getState());
  } catch (e) {
    // Silent fail, continue recording
  }

  if (recording) {
    requestAnimationFrame(() => captureLoop(scene, fmt));
  }
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
