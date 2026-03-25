import { getState, subscribe } from './state.js';

let idleAnimFrame = null;
let currentIdleClass = '';

export const idleAnimations = {
  none: { label: 'Aucune', class: '' },
  breathing: { label: 'Respiration', class: 'anim-breathing' },
  float: { label: 'Flottement', class: 'anim-float' },
  bounce: { label: 'Rebond', class: 'anim-bounce' },
  sway: { label: 'Balancement', class: 'anim-sway' },
};

export const triggerAnimations = {
  none: { label: 'Aucune', class: '' },
  shake: { label: 'Tremblement', class: 'anim-shake' },
  jump: { label: 'Saut', class: 'anim-jump' },
  nod: { label: 'Hochement', class: 'anim-nod' },
  slideInLeft: { label: 'Glisser (gauche)', class: 'anim-slide-in-left' },
  slideInRight: { label: 'Glisser (droite)', class: 'anim-slide-in-right' },
  fadeIn: { label: 'Fondu entrée', class: 'anim-fade-in' },
  fadeOut: { label: 'Fondu sortie', class: 'anim-fade-out' },
  spin: { label: 'Rotation', class: 'anim-spin' },
  grow: { label: 'Grandir', class: 'anim-grow' },
  shrink: { label: 'Rétrécir', class: 'anim-shrink' },
};

export function applyIdleAnimation() {
  const layer = document.getElementById('character-layer');
  if (!layer) return;

  const state = getState();
  const anim = idleAnimations[state.idleAnimation];

  if (currentIdleClass) {
    layer.classList.remove(currentIdleClass);
  }

  if (anim && anim.class) {
    layer.classList.add(anim.class);
    currentIdleClass = anim.class;

    // Apply speed/intensity via CSS vars
    layer.style.setProperty('--anim-speed', (1 / state.idleSpeed) + 's');
    layer.style.setProperty('--anim-intensity', (state.idleIntensity / 100));
  } else {
    currentIdleClass = '';
  }
}

export function triggerAnimation(animId) {
  const layer = document.getElementById('character-layer');
  if (!layer) return;

  const anim = triggerAnimations[animId];
  if (!anim || !anim.class) return;

  // Remove any existing trigger animation
  Object.values(triggerAnimations).forEach((a) => {
    if (a.class) layer.classList.remove(a.class);
  });

  // Force reflow to restart animation
  void layer.offsetWidth;
  layer.classList.add(anim.class);

  // Remove after animation completes
  const handler = () => {
    layer.classList.remove(anim.class);
    layer.removeEventListener('animationend', handler);
  };
  layer.addEventListener('animationend', handler);
}

export function initAnimations() {
  subscribe(() => applyIdleAnimation());
  applyIdleAnimation();
}
