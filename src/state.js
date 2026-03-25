const state = {
  characterName: '',
  characterImg: null,
  backgroundSrc: null,
  backgroundType: 'image',
  position: 'center',
  positionY: 10,
  characterScale: 100,
  boxStyle: 'bottom-full',
  dialogueLines: [],
  currentLineIndex: -1,
  isPlaying: false,
  autoScroll: false,
  autoSpeed: 3,
};

const listeners = new Set();

export function getState() {
  return state;
}

export function update(partial) {
  Object.assign(state, partial);
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
