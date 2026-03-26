import { getState, update, subscribe } from './state.js';
import { addLine, renderDialogueList } from './dialogue.js';
import { startPlayback, stopPlayback, advance } from './typewriter.js';
import { initRenderer, setOutputFormat, setCustomFormat } from './renderer.js';
import { capture } from './screenshot.js';
import { initTabs } from './tabs.js';
import { presets, applyPreset } from './presets.js';
import { initAnimations } from './animations.js';
import { initFX } from './fx.js';
import { startRecording, stopRecording, isRecording } from './recorder.js';
import {
  exportProfile,
  importProfile,
  saveToLocalStorage,
  loadFromLocalStorage,
  deleteLocalProfile,
  getLocalProfiles,
  syncControlsToState,
} from './profiles.js';

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initRenderer();
  initAnimations();
  initFX();

  // Apply default preset
  applyPreset('nes');

  // ============ ASSETS TAB ============

  document.getElementById('character-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    update({ characterImg: URL.createObjectURL(file) });
  });

  document.getElementById('background-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');
    update({ backgroundSrc: url, backgroundType: isVideo ? 'video' : 'image' });
  });

  const outputFormatSelect = document.getElementById('output-format');
  const customResPanel = document.getElementById('custom-resolution');

  outputFormatSelect.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
      customResPanel.style.display = '';
    } else {
      customResPanel.style.display = 'none';
      setOutputFormat(e.target.value);
    }
  });

  document.getElementById('apply-custom-res').addEventListener('click', () => {
    const w = parseInt(document.getElementById('custom-width').value, 10);
    const h = parseInt(document.getElementById('custom-height').value, 10);
    if (w && h) setCustomFormat(w, h);
  });

  // Profiles
  document.getElementById('export-profile-btn').addEventListener('click', exportProfile);

  document.getElementById('import-profile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await importProfile(file);
    } catch (err) {
      alert('Erreur import: ' + err.message);
    }
  });

  document.getElementById('save-profile-btn').addEventListener('click', () => {
    const name = document.getElementById('profile-name').value.trim();
    if (!name) return;
    saveToLocalStorage(name);
    document.getElementById('profile-name').value = '';
    renderProfileList();
  });

  // ============ CHARACTER TAB ============

  document.getElementById('character-name').addEventListener('input', (e) => {
    update({ characterName: e.target.value });
  });

  bindSlider('position-x', 'positionX', '%');
  bindSlider('position-y', 'positionY', '%');
  bindSlider('character-scale', 'characterScale', '%');

  document.getElementById('character-flip').addEventListener('change', (e) => {
    update({ characterFlip: e.target.checked });
  });

  document.getElementById('idle-animation').addEventListener('change', (e) => {
    update({ idleAnimation: e.target.value });
  });

  bindSlider('idle-speed', 'idleSpeed', 'x', true);
  bindSlider('idle-intensity', 'idleIntensity', '%');

  // ============ DIALOGUE BOX TAB ============

  const presetSelect = document.getElementById('preset-select');
  const presetDesc = document.getElementById('preset-description');
  presetSelect.addEventListener('change', (e) => {
    applyPreset(e.target.value);
    syncControlsToState();
    if (presetDesc) presetDesc.textContent = presets[e.target.value]?.description || '';
  });
  // Show initial description
  presetDesc.textContent = presets.nes.description;

  bindSlider('box-position-x', 'boxPositionX', '%');
  bindSlider('box-position-y', 'boxPositionY', '%');
  bindSlider('box-width', 'boxWidth', '%');
  bindSlider('box-height', 'boxHeight', '%');
  bindSlider('box-opacity', 'boxOpacity', '%');
  bindSlider('box-padding', 'boxPadding', 'px');
  bindSlider('box-border-radius', 'boxBorderRadius', 'px');
  bindSlider('font-size', 'fontSize', 'px');
  bindSlider('name-size', 'nameSize', 'px');
  bindSlider('line-height', 'lineHeight', '', true);

  document.getElementById('text-color').addEventListener('input', (e) => {
    update({ textColor: e.target.value });
  });
  document.getElementById('name-color').addEventListener('input', (e) => {
    update({ nameColor: e.target.value });
  });
  document.getElementById('box-bg-color').addEventListener('input', (e) => {
    update({ boxBgColor: e.target.value });
  });
  document.getElementById('reset-box-bg').addEventListener('click', () => {
    update({ boxBgColor: '' });
    document.getElementById('box-bg-color').value = '#00000a';
  });

  // Dialogue lines
  const dialogueInput = document.getElementById('dialogue-input');
  const addLineBtn = document.getElementById('add-line-btn');

  addLineBtn.addEventListener('click', () => {
    if (addLine(dialogueInput.value)) {
      dialogueInput.value = '';
      dialogueInput.focus();
    }
  });

  dialogueInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (addLine(dialogueInput.value)) {
        dialogueInput.value = '';
      }
    }
  });

  // ============ FX TAB ============

  document.getElementById('crt-enabled').addEventListener('change', (e) => {
    update({ crtEnabled: e.target.checked });
  });

  bindSlider('scanline-opacity', 'scanlineOpacity', '%');
  bindSlider('scanline-density', 'scanlineDensity', 'px');
  bindSlider('vignette-intensity', 'vignetteIntensity', '%');

  document.getElementById('glitch-enabled').addEventListener('change', (e) => {
    update({ glitchEnabled: e.target.checked });
  });

  bindSlider('glitch-intensity', 'glitchIntensity', '%');
  bindSlider('glitch-frequency', 'glitchFrequency', '');
  bindSlider('chromatic-aberration', 'chromaticAberration', 'px');
  bindSlider('film-grain', 'filmGrain', '%');
  bindSlider('bloom', 'bloom', '%');
  bindSlider('pixelate', 'pixelate', '%');

  document.getElementById('color-temp').addEventListener('input', (e) => {
    update({ colorTemp: parseInt(e.target.value, 10) });
  });

  bindSlider('saturation', 'saturation', '%');
  bindSlider('contrast', 'contrast', '%');
  bindSlider('brightness-ctrl', 'brightness', '%');

  // ============ PLAYBACK TAB ============

  document.getElementById('play-btn').addEventListener('click', startPlayback);
  document.getElementById('next-btn').addEventListener('click', advance);
  document.getElementById('stop-btn').addEventListener('click', stopPlayback);

  document.getElementById('scene-container').addEventListener('click', () => {
    if (getState().isPlaying) advance();
  });

  bindSlider('type-speed', 'typeSpeed', 'ms');

  document.getElementById('transition-select').addEventListener('change', (e) => {
    update({ transition: e.target.value });
  });

  document.getElementById('auto-scroll').addEventListener('change', (e) => {
    update({ autoScroll: e.target.checked });
  });

  bindSlider('auto-speed', 'autoSpeed', 's', true);

  document.getElementById('screenshot-btn').addEventListener('click', capture);

  // Video recording
  const recordBtn = document.getElementById('record-btn');
  const stopRecordBtn = document.getElementById('stop-record-btn');

  recordBtn.addEventListener('click', () => {
    // Prevent starting if already recording
    if (isRecording()) return;

    // Enable auto-scroll and start playback automatically
    const autoScrollCheckbox = document.getElementById('auto-scroll');
    if (!autoScrollCheckbox.checked) {
      autoScrollCheckbox.checked = true;
      update({ autoScroll: true });
    }
    startPlayback();
    startRecording();
    recordBtn.style.display = 'none';
    stopRecordBtn.style.display = '';
  });

  stopRecordBtn.addEventListener('click', () => {
    if (!isRecording()) return;
    stopRecording();
    stopPlayback();
    stopRecordBtn.style.display = 'none';
    recordBtn.style.display = '';
  });

  // Auto-stop recording when playback finishes
  subscribe((state) => {
    if (!state.isPlaying && isRecording()) {
      stopRecording();
      stopRecordBtn.style.display = 'none';
      recordBtn.style.display = '';
    }
  });

  // ============ INIT ============
  renderDialogueList();
  renderProfileList();
});

// Utility: bind a range slider to state
function bindSlider(elementId, stateKey, suffix, isFloat = false) {
  const el = document.getElementById(elementId);
  const valEl = document.getElementById(elementId + '-value');
  if (!el) return;

  el.addEventListener('input', (e) => {
    const val = isFloat ? parseFloat(e.target.value) : parseInt(e.target.value, 10);
    if (valEl) valEl.textContent = val + suffix;
    update({ [stateKey]: val });
  });
}

function renderProfileList() {
  const container = document.getElementById('profile-list');
  if (!container) return;
  container.innerHTML = '';

  const profiles = getLocalProfiles();
  const names = Object.keys(profiles);

  if (names.length === 0) {
    container.innerHTML = '<p class="no-profiles">Aucun profil sauvegardé</p>';
    return;
  }

  names.forEach((name) => {
    const row = document.createElement('div');
    row.className = 'profile-row';

    const label = document.createElement('span');
    label.textContent = name;

    const loadBtn = document.createElement('button');
    loadBtn.textContent = '📂';
    loadBtn.title = 'Charger';
    loadBtn.addEventListener('click', () => {
      loadFromLocalStorage(name);
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.title = 'Supprimer';
    delBtn.addEventListener('click', () => {
      deleteLocalProfile(name);
      renderProfileList();
    });

    row.appendChild(label);
    row.appendChild(loadBtn);
    row.appendChild(delBtn);
    container.appendChild(row);
  });
}
