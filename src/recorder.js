import html2canvas from 'html2canvas';
import { getOutputFormat, fitSceneToWrapper } from './renderer.js';
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
 * Move the scene offscreen and neutralize its preview transform so
 * html2canvas snapshots it at its true logical (export) dimensions.
 *
 * The scene's width/height are already equal to fmt.width/fmt.height
 * (set by fitSceneToWrapper), so no dimension change is required — we
 * only strip the visual scale and reposition it out of view.
 */
function enterCaptureMode(scene) {
  origSceneStyles = {
    position: scene.style.position,
    left: scene.style.left,
    top: scene.style.top,
    zIndex: scene.style.zIndex,
    visibility: scene.style.visibility,
    transform: scene.style.transform,
    marginRight: scene.style.marginRight,
    marginBottom: scene.style.marginBottom,
  };

  scene.style.position = 'fixed';
  scene.style.left = '-99999px';
  scene.style.top = '0';
  scene.style.zIndex = '-9999';
  scene.style.visibility = 'visible';
  scene.style.transform = 'none';
  scene.style.marginRight = '0';
  scene.style.marginBottom = '0';

  // Force reflow so html2canvas sees the neutralized layout.
  scene.offsetHeight;
}

function exitCaptureMode(scene) {
  if (!origSceneStyles) return;
  scene.style.position = origSceneStyles.position;
  scene.style.left = origSceneStyles.left;
  scene.style.top = origSceneStyles.top;
  scene.style.zIndex = origSceneStyles.zIndex;
  scene.style.visibility = origSceneStyles.visibility;
  scene.style.transform = origSceneStyles.transform;
  scene.style.marginRight = origSceneStyles.marginRight;
  scene.style.marginBottom = origSceneStyles.marginBottom;
  origSceneStyles = null;
}

/**
 * Stop all tracks on the capture stream and release resources.
 */
function cleanupResources(scene) {
  if (captureStream) {
    captureStream.getTracks().forEach((track) => track.stop());
    captureStream = null;
  }
  captureCanvas = null;
  captureCtx = null;
  mediaRecorder = null;
  recordedChunks = [];
  if (scene) exitCaptureMode(scene);

  // Release the recording guard and re-fit the preview to the wrapper.
  document.body.classList.remove('recording');
  fitSceneToWrapper();
}

export function startRecording() {
  // Guard against double-start
  if (recording) return;

  const scene = document.getElementById('scene-container');
  if (!scene) return;

  const fmt = getOutputFormat();

  // Freeze preview layout: from now until cleanup, fitSceneToWrapper is
  // a no-op, so window resizes can't mutate the scene mid-capture.
  document.body.classList.add('recording');

  // Park the scene offscreen with its preview transform neutralized.
  enterCaptureMode(scene);

  try {
    // Create the recording canvas
    captureCanvas = document.createElement('canvas');
    captureCanvas.width = fmt.width;
    captureCanvas.height = fmt.height;
    captureCtx = captureCanvas.getContext('2d');

    // Get a stream from the canvas. MediaRecorder samples this canvas at
    // 30 fps; it will reuse the last-drawn frame if html2canvas hasn't
    // produced a new one yet — that keeps wall-clock timing correct even
    // when html2canvas can't sustain 30 fps at 1080p+.
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
      const chunks = recordedChunks.slice();
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';

      cleanupResources(scene);

      if (chunks.length > 0) {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `vntalk-${fmt.width}x${fmt.height}-${Date.now()}.${ext}`;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
      }
      setStatus('');
    };

    mediaRecorder.onerror = (e) => {
      console.error('MediaRecorder error:', e.error || e);
      recording = false;
      cleanupResources(scene);
      setStatus('Erreur d\'enregistrement');
    };

    mediaRecorder.start(100);
    recording = true;

    // Kick off the single-flight capture loop.
    captureLoop(scene, fmt);
    setStatus('Enregistrement en cours...');
  } catch (e) {
    console.error('Failed to start recording:', e);
    recording = false;
    cleanupResources(scene);
    setStatus('Impossible de démarrer l\'enregistrement');
  }
}

export function stopRecording() {
  if (!recording) return;
  recording = false;

  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    setStatus('Traitement...');
  } else {
    // MediaRecorder not in recording state — clean up manually
    const scene = document.getElementById('scene-container');
    cleanupResources(scene);
    setStatus('');
  }
}

/**
 * Single-flight capture loop: at most one html2canvas call is in flight
 * at any time. MediaRecorder samples the canvas at 30 fps independently
 * — it duplicates the last frame while a new one is being rendered, so
 * animations play at wall-clock speed even if html2canvas only manages
 * ~5–10 real frames per second at full export resolution.
 */
async function captureLoop(scene, fmt) {
  while (recording) {
    try {
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
      applyFXToCanvas(captureCtx, fmt.width, fmt.height, getState());
    } catch (e) {
      console.warn('Capture frame error:', e);
      // Skip this frame; MediaRecorder keeps streaming the last good one.
    }

    // Yield to the browser so UI/animations can advance between frames.
    await new Promise((r) => requestAnimationFrame(r));
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
