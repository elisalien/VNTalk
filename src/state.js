export const defaultState = {
  // Assets
  characterImg: null,
  backgroundSrc: null,
  backgroundType: 'image',

  // Character
  characterName: '',
  positionX: 50,
  positionY: 20,
  characterScale: 100,
  characterFlip: false,
  idleAnimation: 'none',
  idleSpeed: 1,
  idleIntensity: 50,

  // Dialogue Box
  preset: 'nes',
  boxPositionX: 50,
  boxPositionY: 88,
  boxWidth: 90,
  boxHeight: 25,
  boxOpacity: 85,
  boxPadding: 16,
  boxBorderRadius: 0,
  fontSize: 14,
  nameSize: 16,
  textColor: '#ffffff',
  nameColor: '#5b8dd9',
  lineHeight: 1.8,

  // FX
  crtEnabled: true,
  scanlineOpacity: 15,
  scanlineDensity: 2,
  vignetteIntensity: 45,
  glitchEnabled: false,
  glitchIntensity: 30,
  glitchFrequency: 3,
  chromaticAberration: 0,
  filmGrain: 0,
  bloom: 0,
  colorTemp: 50,
  saturation: 100,
  contrast: 100,
  brightness: 100,
  pixelate: 0,

  // Playback
  dialogueLines: [],
  currentLineIndex: -1,
  isPlaying: false,
  autoScroll: false,
  autoSpeed: 3,
  typeSpeed: 45,
  transition: 'instant',
};

const state = { ...defaultState };
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

export function resetState() {
  const img = state.characterImg;
  const bg = state.backgroundSrc;
  const bgType = state.backgroundType;
  const lines = state.dialogueLines;
  Object.assign(state, { ...defaultState, characterImg: img, backgroundSrc: bg, backgroundType: bgType, dialogueLines: lines });
  listeners.forEach((fn) => fn(state));
}
