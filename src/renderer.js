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

function fitSceneToWrapper() {
  const fmt = outputFormats[currentFormat];
  if (!fmt) return;

  const scene = sceneContainer();
  if (!scene) return;

  scene.style.aspectRatio = `${fmt.width} / ${fmt.height}`;

  const wrapper = scene.parentElement;
  if (!wrapper) return;

  const wrapperH = wrapper.clientHeight - 32; // padding
  const wrapperW = wrapper.clientWidth - 32;
  const containerRatio = fmt.width / fmt.height;

  if (containerRatio < 1) {
    // Portrait/tall: height is the limiting factor
    const fitWidth = Math.min(wrapperH * containerRatio, wrapperW);
    scene.style.maxWidth = fitWidth + 'px';
  } else if (containerRatio === 1) {
    // Square: constrain to the smaller dimension
    const fitSize = Math.min(wrapperH, wrapperW);
    scene.style.maxWidth = fitSize + 'px';
  } else {
    scene.style.maxWidth = '960px';
  }
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

  // Recalculate scene fit on window resize
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

  if (nameEl) {
    nameEl.style.fontSize = `clamp(6px, ${state.nameSize * 0.08}vw, ${state.nameSize}px)`;
    nameEl.style.color = state.nameColor;
  }

  if (textEl) {
    textEl.style.fontSize = `clamp(6px, ${state.fontSize * 0.08}vw, ${state.fontSize}px)`;
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
