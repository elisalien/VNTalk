import { update, getState } from './state.js';

export const presets = {
  nes: {
    label: 'NES Classic',
    description: 'Simple 2px border, small pixel font, pure black',
    font: "'Press Start 2P', monospace",
    state: {
      boxOpacity: 95,
      boxBorderRadius: 0,
      boxPadding: 14,
      fontSize: 11,
      nameSize: 13,
      textColor: '#ffffff',
      nameColor: '#fcfcfc',
      lineHeight: 2.0,
      crtEnabled: true,
      scanlineOpacity: 20,
      scanlineDensity: 2,
      vignetteIntensity: 30,
    },
    css: {
      '--preset-bg': '#000000',
      '--preset-border': '3px solid #fcfcfc',
      '--preset-border-inner': '2px solid #a0a0a0',
      '--preset-shadow': 'none',
      '--preset-corner': 'none',
      '--preset-name-bg': 'transparent',
      '--preset-font': "'Press Start 2P', monospace",
      '--preset-ornament': 'none',
      '--preset-glow': 'none',
    },
  },
  snes: {
    label: 'SNES RPG',
    description: 'Double border, blue gradient, ornate corners',
    font: "'Press Start 2P', monospace",
    state: {
      boxOpacity: 92,
      boxBorderRadius: 8,
      boxPadding: 18,
      fontSize: 13,
      nameSize: 15,
      textColor: '#ffffff',
      nameColor: '#ffd700',
      lineHeight: 1.9,
      crtEnabled: true,
      scanlineOpacity: 10,
      scanlineDensity: 2,
      vignetteIntensity: 25,
    },
    css: {
      '--preset-bg': 'linear-gradient(180deg, #0a1a4a 0%, #0c1038 100%)',
      '--preset-border': '3px solid #5580cc',
      '--preset-border-inner': '2px solid #2a4080',
      '--preset-shadow': 'inset 0 0 20px rgba(30, 60, 140, 0.4), 0 0 10px rgba(0,0,0,0.5)',
      '--preset-corner': '"◆"',
      '--preset-name-bg': 'linear-gradient(90deg, rgba(85,128,204,0.3), transparent)',
      '--preset-font': "'Press Start 2P', monospace",
      '--preset-ornament': 'block',
      '--preset-glow': 'none',
    },
  },
  ps1: {
    label: 'PS1 JRPG',
    description: 'Semi-transparent blur, smooth font, portrait-ready',
    font: "'VT323', monospace",
    state: {
      boxOpacity: 70,
      boxBorderRadius: 4,
      boxPadding: 20,
      fontSize: 18,
      nameSize: 20,
      textColor: '#f0f0f0',
      nameColor: '#80d0ff',
      lineHeight: 1.6,
      crtEnabled: false,
      scanlineOpacity: 0,
      scanlineDensity: 2,
      vignetteIntensity: 20,
    },
    css: {
      '--preset-bg': 'rgba(10, 15, 40, 0.75)',
      '--preset-border': '2px solid rgba(120, 160, 220, 0.6)',
      '--preset-border-inner': 'none',
      '--preset-shadow': '0 4px 30px rgba(0,0,0,0.5)',
      '--preset-corner': 'none',
      '--preset-name-bg': 'rgba(80, 160, 255, 0.15)',
      '--preset-font': "'VT323', monospace",
      '--preset-ornament': 'none',
      '--preset-glow': '0 0 15px rgba(80, 160, 255, 0.2)',
    },
  },
  gameboy: {
    label: 'Game Boy',
    description: 'Monochrome green, thick scanlines, chunky',
    font: "'Press Start 2P', monospace",
    state: {
      boxOpacity: 95,
      boxBorderRadius: 0,
      boxPadding: 12,
      fontSize: 11,
      nameSize: 13,
      textColor: '#0f380f',
      nameColor: '#0f380f',
      lineHeight: 2.2,
      crtEnabled: true,
      scanlineOpacity: 30,
      scanlineDensity: 3,
      vignetteIntensity: 20,
    },
    css: {
      '--preset-bg': '#8bac0f',
      '--preset-border': '3px solid #306230',
      '--preset-border-inner': '2px solid #0f380f',
      '--preset-shadow': 'none',
      '--preset-corner': 'none',
      '--preset-name-bg': '#9bbc0f',
      '--preset-font': "'Press Start 2P', monospace",
      '--preset-ornament': 'none',
      '--preset-glow': 'none',
    },
  },
  vnmodern: {
    label: 'Visual Novel',
    description: 'Clean, wide, transparent, elegant',
    font: "'Nunito', sans-serif",
    state: {
      boxOpacity: 60,
      boxBorderRadius: 12,
      boxPadding: 24,
      fontSize: 16,
      nameSize: 18,
      textColor: '#ffffff',
      nameColor: '#ff8fab',
      lineHeight: 1.7,
      crtEnabled: false,
      scanlineOpacity: 0,
      scanlineDensity: 2,
      vignetteIntensity: 15,
    },
    css: {
      '--preset-bg': 'rgba(0, 0, 0, 0.55)',
      '--preset-border': '1px solid rgba(255,255,255,0.15)',
      '--preset-border-inner': 'none',
      '--preset-shadow': '0 8px 32px rgba(0,0,0,0.3)',
      '--preset-corner': 'none',
      '--preset-name-bg': 'rgba(255, 143, 171, 0.15)',
      '--preset-font': "'Nunito', sans-serif",
      '--preset-ornament': 'none',
      '--preset-glow': 'none',
    },
  },
  terminal: {
    label: 'Retro Terminal',
    description: 'Green phosphor, blinking cursor, hacker vibes',
    font: "'VT323', monospace",
    state: {
      boxOpacity: 92,
      boxBorderRadius: 0,
      boxPadding: 16,
      fontSize: 18,
      nameSize: 20,
      textColor: '#00ff41',
      nameColor: '#00cc33',
      lineHeight: 1.5,
      crtEnabled: true,
      scanlineOpacity: 25,
      scanlineDensity: 2,
      vignetteIntensity: 50,
    },
    css: {
      '--preset-bg': '#0a0a0a',
      '--preset-border': '1px solid #00ff41',
      '--preset-border-inner': 'none',
      '--preset-shadow': 'inset 0 0 30px rgba(0, 255, 65, 0.05), 0 0 10px rgba(0, 255, 65, 0.1)',
      '--preset-corner': 'none',
      '--preset-name-bg': 'rgba(0, 255, 65, 0.08)',
      '--preset-font': "'VT323', monospace",
      '--preset-ornament': 'none',
      '--preset-glow': '0 0 8px rgba(0, 255, 65, 0.4)',
    },
  },
  kawaii: {
    label: 'Kawaii Cutecore',
    description: 'Pastel pink/purple, hearts, stars, bubbly',
    font: "'Nunito', sans-serif",
    state: {
      boxOpacity: 85,
      boxBorderRadius: 20,
      boxPadding: 22,
      fontSize: 15,
      nameSize: 17,
      textColor: '#5c4363',
      nameColor: '#e75480',
      lineHeight: 1.7,
      crtEnabled: false,
      scanlineOpacity: 0,
      scanlineDensity: 2,
      vignetteIntensity: 10,
    },
    css: {
      '--preset-bg': 'linear-gradient(135deg, rgba(255,182,217,0.9) 0%, rgba(204,170,255,0.9) 50%, rgba(170,210,255,0.9) 100%)',
      '--preset-border': '3px solid #ffb6d9',
      '--preset-border-inner': '2px solid rgba(255,255,255,0.5)',
      '--preset-shadow': '0 4px 20px rgba(231,84,128,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
      '--preset-corner': '"✦"',
      '--preset-name-bg': 'rgba(255, 182, 217, 0.4)',
      '--preset-font': "'Nunito', sans-serif",
      '--preset-ornament': 'block',
      '--preset-glow': '0 0 20px rgba(255, 182, 217, 0.3)',
    },
  },
};

export function applyPreset(presetId) {
  const preset = presets[presetId];
  if (!preset) return;

  // Apply state overrides
  update({ preset: presetId, ...preset.state });

  // Apply CSS custom properties to scene
  const scene = document.getElementById('scene-container');
  if (scene) {
    Object.entries(preset.css).forEach(([prop, val]) => {
      scene.style.setProperty(prop, val);
    });
  }

  // Update dialogue box font
  const box = document.getElementById('dialogue-box');
  if (box) {
    box.style.fontFamily = preset.font;
  }
}

export function getCurrentPresetCSS() {
  const state = getState();
  return presets[state.preset]?.css || presets.nes.css;
}
