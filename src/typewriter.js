import { getState, update, subscribe } from './state.js';
import { renderDialogueList } from './dialogue.js';

let charIndex = 0;
let typewriterTimer = null;
let autoAdvanceTimer = null;
const TYPE_SPEED = 45; // ms per character

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
  typeLine(0);
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
    const text = state.dialogueLines[state.currentLineIndex];
    if (text) {
      dialogueTextEl().textContent = text;
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
  typeLine(nextIndex);
}

function typeLine(index) {
  const state = getState();
  const text = state.dialogueLines[index];
  if (!text) return;

  const nameEl = dialogueNameEl();
  const textEl = dialogueTextEl();
  if (nameEl) nameEl.textContent = state.characterName || '';
  if (textEl) textEl.textContent = '';

  charIndex = 0;
  typeNextChar(text);
}

function typeNextChar(text) {
  const textEl = dialogueTextEl();
  if (!textEl) return;

  if (charIndex < text.length) {
    textEl.textContent += text[charIndex];
    charIndex++;
    typewriterTimer = setTimeout(() => typeNextChar(text), TYPE_SPEED);
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
