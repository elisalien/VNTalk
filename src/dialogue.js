import { getState, update } from './state.js';

const listEl = () => document.getElementById('dialogue-list');

export function addLine(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const state = getState();
  const lines = [...state.dialogueLines, trimmed];
  update({ dialogueLines: lines });
  renderDialogueList();
  return true;
}

export function removeLine(index) {
  const state = getState();
  const lines = [...state.dialogueLines];
  lines.splice(index, 1);

  let currentIndex = state.currentLineIndex;
  if (currentIndex >= lines.length) {
    currentIndex = lines.length - 1;
  }

  update({ dialogueLines: lines, currentLineIndex: currentIndex });
  renderDialogueList();
}

export function editLine(index, newText) {
  const trimmed = newText.trim();
  if (!trimmed) return;

  const state = getState();
  const lines = [...state.dialogueLines];
  lines[index] = trimmed;
  update({ dialogueLines: lines });
  renderDialogueList();
}

export function renderDialogueList() {
  const el = listEl();
  if (!el) return;

  const state = getState();
  el.innerHTML = '';

  state.dialogueLines.forEach((line, i) => {
    const li = document.createElement('li');
    li.className = 'dialogue-item';
    if (i === state.currentLineIndex) {
      li.classList.add('active');
    }

    const span = document.createElement('span');
    span.className = 'dialogue-item-text';
    span.textContent = line;

    const actions = document.createElement('div');
    actions.className = 'dialogue-item-actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.title = 'Modifier';
    editBtn.type = 'button';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newText = prompt('Modifier la ligne :', line);
      if (newText !== null) {
        editLine(i, newText);
      }
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Supprimer';
    deleteBtn.type = 'button';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeLine(i);
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(span);
    li.appendChild(actions);
    el.appendChild(li);
  });
}
