import html2canvas from 'html2canvas';
import { getOutputFormat } from './renderer.js';

let mediaRecorder = null;
let recordedChunks = [];
let recording = false;
let captureCanvas = null;
let captureCtx = null;
let captureStream = null;

const statusEl = () => document.getElementById('record-status');

export function isRecording() {
  return recording;
}

export function startRecording() {
  const scene = document.getElementById('scene-container');
  if (!scene) return;

  const fmt = getOutputFormat();

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
    // html2canvas captures all CSS filters, overlays, and FX
    const canvas = await html2canvas(scene, {
      width: fmt.width,
      height: fmt.height,
      scale: 1,
      useCORS: true,
      backgroundColor: '#000',
    });

    if (!recording) return;

    // Draw the captured frame onto the recording canvas
    captureCtx.clearRect(0, 0, fmt.width, fmt.height);
    captureCtx.drawImage(canvas, 0, 0, fmt.width, fmt.height);
  } catch (e) {
    // Silent fail, continue recording
  }

  // Schedule next frame — html2canvas is async so we just loop as fast as it can go
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
