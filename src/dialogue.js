import { getState, update } from './state.js';
import { triggerAnimations } from './animations.js';

const listEl = () => document.getElementById('dialogue-list');

/**
 * Each dialogue line: { text: string, animation: string }
 */
export function addLine(text, animation = 'none') {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const state = getState();
  const lines = [...state.dialogueLines, { text: trimmed, animation }];
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

export function editLine(index, newText, newAnimation) {
  const trimmed = newText.trim();
  if (!trimmed) return;

  const state = getState();
  const lines = [...state.dialogueLines];
  lines[index] = { text: trimmed, animation: newAnimation || lines[index].animation };
  update({ dialogueLines: lines });
  renderDialogueList();
}

export function reorderLine(fromIndex, toIndex) {
  const state = getState();
  const lines = [...state.dialogueLines];
  const [moved] = lines.splice(fromIndex, 1);
  lines.splice(toIndex, 0, moved);
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
    li.draggable = true;
    li.dataset.index = i;
    if (i === state.currentLineIndex) {
      li.classList.add('active');
    }

    // Index number
    const num = document.createElement('span');
    num.className = 'dialogue-item-num';
    num.textContent = (i + 1) + '.';

    const span = document.createElement('span');
    span.className = 'dialogue-item-text';
    span.textContent = line.text;

    // Animation badge
    const badge = document.createElement('span');
    badge.className = 'dialogue-item-badge';
    if (line.animation && line.animation !== 'none') {
      const animDef = triggerAnimations[line.animation];
      badge.textContent = animDef ? animDef.label : line.animation;
    }

    const actions = document.createElement('div');
    actions.className = 'dialogue-item-actions';

    const animBtn = document.createElement('button');
    animBtn.textContent = '🎬';
    animBtn.title = 'Animation';
    animBtn.type = 'button';
    animBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showAnimationPicker(i, line.animation);
    });

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.title = 'Modifier';
    editBtn.type = 'button';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newText = prompt('Modifier la ligne :', line.text);
      if (newText !== null && newText.trim()) {
        editLine(i, newText, line.animation);
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

    actions.appendChild(animBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(num);
    li.appendChild(span);
    li.appendChild(badge);
    li.appendChild(actions);

    // Drag & drop
    li.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', i.toString());
      li.classList.add('dragging');
    });
    li.addEventListener('dragend', () => li.classList.remove('dragging'));
    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      li.classList.add('drag-over');
    });
    li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
    li.addEventListener('drop', (e) => {
      e.preventDefault();
      li.classList.remove('drag-over');
      const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
      if (from !== i) reorderLine(from, i);
    });

    el.appendChild(li);
  });
}

function showAnimationPicker(lineIndex, currentAnim) {
  // Remove existing picker
  const old = document.getElementById('anim-picker');
  if (old) old.remove();

  const picker = document.createElement('div');
  picker.id = 'anim-picker';
  picker.className = 'anim-picker-popup';

  const title = document.createElement('div');
  title.className = 'anim-picker-title';
  title.textContent = 'Animation ligne ' + (lineIndex + 1);
  picker.appendChild(title);

  Object.entries(triggerAnimations).forEach(([id, anim]) => {
    const btn = document.createElement('button');
    btn.textContent = anim.label;
    btn.className = 'anim-picker-btn' + (id === currentAnim ? ' active' : '');
    btn.addEventListener('click', () => {
      const state = getState();
      const lines = [...state.dialogueLines];
      lines[lineIndex] = { ...lines[lineIndex], animation: id };
      update({ dialogueLines: lines });
      renderDialogueList();
      picker.remove();
    });
    picker.appendChild(btn);
  });

  const close = document.createElement('button');
  close.textContent = '✕ Fermer';
  close.className = 'anim-picker-close';
  close.addEventListener('click', () => picker.remove());
  picker.appendChild(close);

  document.getElementById('controls').appendChild(picker);
}
