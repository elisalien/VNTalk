import { getState, update } from './state.js';
import { applyPreset } from './presets.js';
import { renderDialogueList } from './dialogue.js';

const STORAGE_KEY = 'vntalk_profiles';

export function exportProfile() {
  const state = getState();
  // Exclude non-serializable stuff
  const { characterImg, backgroundSrc, ...exportable } = state;
  const json = JSON.stringify(exportable, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = `vntalk-profile-${Date.now()}.json`;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
}

export function importProfile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        // Keep current images
        const state = getState();
        data.characterImg = state.characterImg;
        data.backgroundSrc = state.backgroundSrc;
        data.backgroundType = state.backgroundType;
        update(data);
        applyPreset(data.preset || 'nes');
        renderDialogueList();
        syncControlsToState();
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function saveToLocalStorage(name) {
  const state = getState();
  const { characterImg, backgroundSrc, ...exportable } = state;
  const profiles = getLocalProfiles();
  profiles[name] = { ...exportable, savedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export function loadFromLocalStorage(name) {
  const profiles = getLocalProfiles();
  const data = profiles[name];
  if (!data) return false;

  const state = getState();
  data.characterImg = state.characterImg;
  data.backgroundSrc = state.backgroundSrc;
  data.backgroundType = state.backgroundType;
  update(data);
  applyPreset(data.preset || 'nes');
  renderDialogueList();
  syncControlsToState();
  return true;
}

export function deleteLocalProfile(name) {
  const profiles = getLocalProfiles();
  delete profiles[name];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export function getLocalProfiles() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function syncControlsToState() {
  const state = getState();
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) {
      if (el.type === 'checkbox') el.checked = val;
      else if (el.type === 'range') { el.value = val; }
      else el.value = val;
    }
  };
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setVal('character-name', state.characterName);
  setVal('position-x', state.positionX);
  setText('position-x-value', state.positionX + '%');
  setVal('position-y', state.positionY);
  setText('position-y-value', state.positionY + '%');
  setVal('character-scale', state.characterScale);
  setText('character-scale-value', state.characterScale + '%');
  setVal('character-flip', state.characterFlip);
  setVal('idle-animation', state.idleAnimation);
  setVal('idle-speed', state.idleSpeed);
  setText('idle-speed-value', state.idleSpeed + 'x');
  setVal('idle-intensity', state.idleIntensity);
  setText('idle-intensity-value', state.idleIntensity + '%');

  setVal('preset-select', state.preset);
  setVal('box-position-x', state.boxPositionX);
  setText('box-position-x-value', state.boxPositionX + '%');
  setVal('box-position-y', state.boxPositionY);
  setText('box-position-y-value', state.boxPositionY + '%');
  setVal('box-width', state.boxWidth);
  setText('box-width-value', state.boxWidth + '%');
  setVal('box-height', state.boxHeight);
  setText('box-height-value', state.boxHeight + '%');
  setVal('box-opacity', state.boxOpacity);
  setText('box-opacity-value', state.boxOpacity + '%');
  setVal('box-padding', state.boxPadding);
  setText('box-padding-value', state.boxPadding + 'px');
  setVal('box-border-radius', state.boxBorderRadius);
  setText('box-border-radius-value', state.boxBorderRadius + 'px');
  setVal('font-size', state.fontSize);
  setText('font-size-value', state.fontSize + 'px');
  setVal('name-size', state.nameSize);
  setText('name-size-value', state.nameSize + 'px');
  setVal('text-color', state.textColor);
  setVal('name-color', state.nameColor);
  setVal('box-bg-color', state.boxBgColor || '#00000a');
  setVal('line-height', state.lineHeight);
  setText('line-height-value', state.lineHeight);

  setVal('crt-enabled', state.crtEnabled);
  setVal('scanline-opacity', state.scanlineOpacity);
  setText('scanline-opacity-value', state.scanlineOpacity + '%');
  setVal('scanline-density', state.scanlineDensity);
  setText('scanline-density-value', state.scanlineDensity + 'px');
  setVal('vignette-intensity', state.vignetteIntensity);
  setText('vignette-intensity-value', state.vignetteIntensity + '%');
  setVal('glitch-enabled', state.glitchEnabled);
  setVal('glitch-intensity', state.glitchIntensity);
  setText('glitch-intensity-value', state.glitchIntensity + '%');
  setVal('glitch-frequency', state.glitchFrequency);
  setText('glitch-frequency-value', state.glitchFrequency);
  setVal('chromatic-aberration', state.chromaticAberration);
  setText('chromatic-aberration-value', state.chromaticAberration + 'px');
  setVal('film-grain', state.filmGrain);
  setText('film-grain-value', state.filmGrain + '%');
  setVal('bloom', state.bloom);
  setText('bloom-value', state.bloom + '%');
  setVal('color-temp', state.colorTemp);
  setVal('saturation', state.saturation);
  setText('saturation-value', state.saturation + '%');
  setVal('contrast', state.contrast);
  setText('contrast-value', state.contrast + '%');
  setVal('brightness-ctrl', state.brightness);
  setText('brightness-value', state.brightness + '%');
  setVal('pixelate', state.pixelate);
  setText('pixelate-value', state.pixelate + '%');

  setVal('auto-scroll', state.autoScroll);
  setVal('auto-speed', state.autoSpeed);
  setText('auto-speed-value', state.autoSpeed + 's');
  setVal('type-speed', state.typeSpeed);
  setText('type-speed-value', state.typeSpeed + 'ms');
  setVal('transition-select', state.transition);
}
