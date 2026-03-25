import { subscribe, getState } from './state.js';

const bgLayer = () => document.getElementById('background-layer');
const charLayer = () => document.getElementById('character-layer');
const dialogueBox = () => document.getElementById('dialogue-box');

export function initRenderer() {
  subscribe((state) => {
    renderBackground(state);
    renderCharacter(state);
    renderBoxStyle(state);
  });

  // Initial render
  const state = getState();
  renderBackground(state);
  renderCharacter(state);
  renderBoxStyle(state);
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

  // Position X
  layer.className = '';
  layer.classList.add('character-' + state.position);

  // Position Y — range is -50% to 100% for extended placement
  layer.style.top = state.positionY + '%';

  // Scale
  const scale = (state.characterScale || 100) / 100;
  img.style.transform = `scale(${scale})`;
  img.style.transformOrigin = 'bottom center';
}

function renderBoxStyle(state) {
  const box = dialogueBox();
  if (!box) return;

  box.className = state.boxStyle;
}
