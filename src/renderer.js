import { subscribe, getState } from './state.js';
import { getCurrentPresetCSS } from './presets.js';

const bgLayer = () => document.getElementById('background-layer');
const charLayer = () => document.getElementById('character-layer');
const dialogueBox = () => document.getElementById('dialogue-box');
const sceneContainer = () => document.getElementById('scene-container');

export const outputFormats = {
  '16:9': { width: 1920, height: 1080, label: '1920×1080 (16:9)' },
  '9:16': { width: 1080, height: 1920, label: '1080×1920 (9:16)' },
  '4:5': { width: 1080, height: 1350, label: '1080×1350 (4:5)' },
  '1:1': { width: 1080, height: 1080, label: '1080×1080 (1:1)' },
  '4:3': { width: 1440, height: 1080, label: '1440×1080 (4:3)' },
  '21:9': { width: 2560, height: 1080, label: '2560×1080 (21:9)' },
};

export function setCustomFormat(width, height) {
  const w = Math.max(100, Math.min(7680, Math.round(width)));
  const h = Math.max(100, Math.min(7680, Math.round(height)));
  outputFormats['custom'] = { width: w, height: h, label: `${w}×${h} (custom)` };
  setOutputFormat('custom');
}

let currentFormat = '16:9';

export function setOutputFormat(formatId) {
  const fmt = outputFormats[formatId];
  if (!fmt) return;
  currentFormat = formatId;
  fitSceneToWrapper();
}

/**
 * Size the scene to its logical (export) dimensions and scale it visually
 * to fit the wrapper. The scene's DOM box remains at fmt.width × fmt.height
 * so all child layout (%, cqw, transforms) resolves against a stable target
 * identical to the export canvas. Only the visual transform changes.
 *
 * Negative margins reclaim the layout space the scale(k) transform would
 * otherwise leave behind, so flex centering stays accurate.
 *
 * No-op while recording: the capture pipeline relies on the scene's layout
 * staying frozen during html2canvas snapshots.
 */
export function fitSceneToWrapper() {
  if (document.body.classList.contains('recording')) return;

  const fmt = outputFormats[currentFormat];
  if (!fmt) return;

  const scene = sceneContainer();
  if (!scene) return;

  const wrapper = scene.parentElement;
  if (!wrapper) return;

  // Logical dimensions = export dimensions, always.
  scene.style.width = fmt.width + 'px';
  scene.style.height = fmt.height + 'px';

  const availW = Math.max(0, wrapper.clientWidth - 32);
  const availH = Math.max(0, wrapper.clientHeight - 32);

  // Fit by the tighter dimension; never upscale past 1:1.
  const scale = Math.min(availW / fmt.width, availH / fmt.height, 1);
  const safeScale = scale > 0 && isFinite(scale) ? scale : 1;

  scene.style.setProperty('--scene-scale', String(safeScale));
  scene.style.transform = `scale(${safeScale})`;

  // Reclaim the layout space the transform visually removes so flex
  // centering sees the post-scale footprint.
  scene.style.marginRight = `${(safeScale - 1) * fmt.width}px`;
  scene.style.marginBottom = `${(safeScale - 1) * fmt.height}px`;
}

export function getOutputFormat() {
  return { id: currentFormat, ...outputFormats[currentFormat] };
}

export function initRenderer() {
  subscribe((state) => {
    renderBackground(state);
    renderCharacter(state);
    renderDialogueBox(state);
  });

  const state = getState();
  renderBackground(state);
  renderCharacter(state);
  renderDialogueBox(state);

  // Apply the initial fit now that the scene exists.
  fitSceneToWrapper();

  // Recalculate scene fit on window resize. The fit function itself
  // short-circuits while `body.recording` is set so the capture loop
  // sees a frozen layout.
  window.addEventListener('resize', () => fitSceneToWrapper());
}

function renderBackground(state) {
  const layer = bgLayer();
  if (!layer) return;

  if (!state.backgroundSrc) {
    layer.innerHTML = '';
    return;
  }

  const existing = layer.querySelector('img, video');
  if (existing && existing.dataset.src === state.backgroundSrc) return;

  layer.innerHTML = '';

  if (state.backgroundType === 'video') {
    const video = document.createElement('video');
    video.src = state.backgroundSrc;
    video.dataset.src = state.backgroundSrc;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    layer.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = state.backgroundSrc;
    img.dataset.src = state.backgroundSrc;
    img.alt = 'Background';
    layer.appendChild(img);
  }
}

function renderCharacter(state) {
  const layer = charLayer();
  if (!layer) return;

  if (!state.characterImg) {
    layer.innerHTML = '';
    layer.style.display = 'none';
    return;
  }

  layer.style.display = '';

  let img = layer.querySelector('img');
  if (!img) {
    img = document.createElement('img');
    img.alt = 'Character';
    layer.appendChild(img);
  }

  if (img.src !== state.characterImg) {
    img.src = state.characterImg;
  }

  // Free X positioning (0-100%)
  layer.style.left = state.positionX + '%';
  layer.style.transform = `translateX(-50%)${state.characterFlip ? ' scaleX(-1)' : ''}`;

  // Y positioning (-50% to 100%)
  layer.style.top = state.positionY + '%';

  // Scale
  const scale = (state.characterScale || 100) / 100;
  img.style.transform = `scale(${scale})`;
  img.style.transformOrigin = 'bottom center';
}

function renderDialogueBox(state) {
  const box = dialogueBox();
  if (!box) return;

  // Free positioning
  box.style.left = state.boxPositionX + '%';
  box.style.top = state.boxPositionY + '%';
  box.style.transform = 'translate(-50%, -50%)';

  // Size
  box.style.width = state.boxWidth + '%';
  box.style.height = state.boxHeight + '%';

  // Background color override (when user picks a custom color)
  if (state.boxBgColor) {
    const opacity = (state.boxOpacity || 85) / 100;
    box.style.background = hexToRgba(state.boxBgColor, opacity);
  } else {
    // Use preset bg via CSS var
    box.style.background = '';
  }

  // Padding
  box.style.padding = state.boxPadding + 'px';

  // Border radius override
  if (state.boxBorderRadius > 0) {
    box.style.borderRadius = state.boxBorderRadius + 'px';
  } else {
    box.style.borderRadius = '';
  }

  // Text sizing — responsive based on box size
  const nameEl = document.getElementById('dialogue-name');
  const textEl = document.getElementById('dialogue-text');

  // Font sizing uses `cqw` (container query width) so text scales from the
  // scene width — stable across preview and export, independent of viewport.
  if (nameEl) {
    nameEl.style.fontSize = `clamp(6px, ${state.nameSize * 0.08}cqw, ${state.nameSize}px)`;
    nameEl.style.color = state.nameColor;
  }

  if (textEl) {
    textEl.style.fontSize = `clamp(6px, ${state.fontSize * 0.08}cqw, ${state.fontSize}px)`;
    textEl.style.color = state.textColor;
    textEl.style.lineHeight = state.lineHeight;
  }
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
