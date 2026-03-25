import { getState, update, subscribe } from './state.js';
import { renderDialogueList } from './dialogue.js';
import { triggerAnimation } from './animations.js';

let charIndex = 0;
let typewriterTimer = null;
let autoAdvanceTimer = null;

const dialogueTextEl = () => document.getElementById('dialogue-text');
const dialogueNameEl = () => document.getElementById('dialogue-name');
const dialogueBoxEl = () => document.getElementById('dialogue-box');

export function startPlayback() {
  const state = getState();
  if (state.dialogueLines.length === 0) return;

  stopPlayback();
  update({ isPlaying: true, currentLineIndex: 0 });
  renderDialogueList();
  showDialogueBox();
  playLine(0);
}

export function stopPlayback() {
  clearTimeout(typewriterTimer);
  clearTimeout(autoAdvanceTimer);
  typewriterTimer = null;
  autoAdvanceTimer = null;
  charIndex = 0;
  update({ isPlaying: false, currentLineIndex: -1 });
  renderDialogueList();
  hideDialogueBox();
}

export function advance() {
  const state = getState();
  if (!state.isPlaying) return;

  clearTimeout(autoAdvanceTimer);
  autoAdvanceTimer = null;

  // If typewriter is still running, complete the current line instantly
  if (typewriterTimer) {
    clearTimeout(typewriterTimer);
    typewriterTimer = null;
    const line = state.dialogueLines[state.currentLineIndex];
    if (line) {
      dialogueTextEl().textContent = line.text;
    }
    scheduleAutoAdvance();
    return;
  }

  const nextIndex = state.currentLineIndex + 1;
  if (nextIndex >= state.dialogueLines.length) {
    stopPlayback();
    return;
  }

  update({ currentLineIndex: nextIndex });
  renderDialogueList();
  playLine(nextIndex);
}

function playLine(index) {
  const state = getState();
  const line = state.dialogueLines[index];
  if (!line) return;

  const nameEl = dialogueNameEl();
  const textEl = dialogueTextEl();
  if (!textEl) return;

  if (nameEl) nameEl.textContent = state.characterName || '';

  // Apply transition
  applyTransition(textEl, state.transition, () => {
    textEl.textContent = '';
    charIndex = 0;

    // Trigger per-line animation
    if (line.animation && line.animation !== 'none') {
      triggerAnimation(line.animation);
    }

    typeNextChar(line.text, state.typeSpeed);
  });
}

function applyTransition(el, type, callback) {
  if (type === 'fade') {
    el.style.transition = 'opacity 0.25s';
    el.style.opacity = '0';
    setTimeout(() => {
      callback();
      el.style.opacity = '1';
    }, 250);
  } else if (type === 'slide') {
    el.style.transition = 'transform 0.2s, opacity 0.2s';
    el.style.transform = 'translateY(-10px)';
    el.style.opacity = '0';
    setTimeout(() => {
      callback();
      el.style.transform = 'translateY(0)';
      el.style.opacity = '1';
    }, 200);
  } else {
    callback();
  }
}

function typeNextChar(text, speed) {
  const textEl = dialogueTextEl();
  if (!textEl) return;

  if (charIndex < text.length) {
    textEl.textContent += text[charIndex];
    charIndex++;
    typewriterTimer = setTimeout(() => typeNextChar(text, speed), speed);
  } else {
    typewriterTimer = null;
    scheduleAutoAdvance();
  }
}

function scheduleAutoAdvance() {
  const state = getState();
  if (state.autoScroll && state.isPlaying) {
    autoAdvanceTimer = setTimeout(() => {
      advance();
    }, state.autoSpeed * 1000);
  }
}

function showDialogueBox() {
  const box = dialogueBoxEl();
  if (box) box.style.display = '';
}

function hideDialogueBox() {
  const box = dialogueBoxEl();
  if (box) box.style.display = 'none';
  const textEl = dialogueTextEl();
  if (textEl) textEl.textContent = '';
}
