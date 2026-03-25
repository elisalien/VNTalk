import { getState, update } from './state.js';
import { addLine, renderDialogueList } from './dialogue.js';
import { startPlayback, stopPlayback, advance } from './typewriter.js';
import { initRenderer } from './renderer.js';
import { capture } from './screenshot.js';

document.addEventListener('DOMContentLoaded', () => {
  initRenderer();

  // --- Character upload ---
  const charUpload = document.getElementById('character-upload');
  charUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    update({ characterImg: url });
  });

  // --- Background upload ---
  const bgUpload = document.getElementById('background-upload');
  bgUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');
    update({ backgroundSrc: url, backgroundType: isVideo ? 'video' : 'image' });
  });

  // --- Character name ---
  const nameInput = document.getElementById('character-name');
  nameInput.addEventListener('input', (e) => {
    update({ characterName: e.target.value });
  });

  // --- Character position X ---
  const posSelect = document.getElementById('character-position');
  posSelect.addEventListener('change', (e) => {
    update({ position: e.target.value });
  });

  // --- Character position Y ---
  const ySlider = document.getElementById('character-y');
  const yValue = document.getElementById('character-y-value');
  ySlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    yValue.textContent = val + '%';
    update({ positionY: val });
  });

  // --- Character scale ---
  const scaleSlider = document.getElementById('character-scale');
  const scaleValue = document.getElementById('character-scale-value');
  scaleSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    scaleValue.textContent = val + '%';
    update({ characterScale: val });
  });

  // --- Box style ---
  const boxSelect = document.getElementById('box-style');
  boxSelect.addEventListener('change', (e) => {
    update({ boxStyle: e.target.value });
  });

  // --- Add dialogue line ---
  const dialogueInput = document.getElementById('dialogue-input');
  const addLineBtn = document.getElementById('add-line-btn');

  addLineBtn.addEventListener('click', () => {
    const success = addLine(dialogueInput.value);
    if (success) {
      dialogueInput.value = '';
      dialogueInput.focus();
    }
  });

  // Also add on Enter (without Shift)
  dialogueInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const success = addLine(dialogueInput.value);
      if (success) {
        dialogueInput.value = '';
      }
    }
  });

  // --- Playback controls ---
  document.getElementById('play-btn').addEventListener('click', startPlayback);
  document.getElementById('next-btn').addEventListener('click', advance);
  document.getElementById('stop-btn').addEventListener('click', stopPlayback);

  // Click on scene to advance
  document.getElementById('scene-container').addEventListener('click', () => {
    const state = getState();
    if (state.isPlaying) {
      advance();
    }
  });

  // --- Auto scroll ---
  const autoScrollCheck = document.getElementById('auto-scroll');
  const autoSpeedLabel = document.getElementById('auto-speed-label');
  const autoSpeedSlider = document.getElementById('auto-speed');
  const autoSpeedValue = document.getElementById('auto-speed-value');

  autoScrollCheck.addEventListener('change', (e) => {
    update({ autoScroll: e.target.checked });
    autoSpeedLabel.style.display = e.target.checked ? '' : 'none';
  });

  autoSpeedSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    autoSpeedValue.textContent = val + 's';
    update({ autoSpeed: val });
  });

  // --- Screenshot ---
  document.getElementById('screenshot-btn').addEventListener('click', capture);

  // Initial dialogue list render
  renderDialogueList();
});
