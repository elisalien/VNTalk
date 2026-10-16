# VN Dialogue Maker

> Générateur de dialogues façon Visual Novel — style RPG rétro avec effets CRT, export en image ou en vidéo.

![Platform](https://img.shields.io/badge/platform-Web-informational) ![Stack](https://img.shields.io/badge/stack-Vite%20%2B%20JavaScript-orange)

## À propos

VN Dialogue Maker (dépôt `vntalk`) compose une scène de visual novel à partir d'un personnage, d'un décor et de lignes de dialogue, puis les anime avec un effet machine à écrire. Les boîtes de dialogue reprennent des styles de jeux rétro, et la scène peut être habillée d'effets CRT / post-prod avant d'être exportée en PNG ou enregistrée en vidéo.

## Fonctionnalités

- **Assets** : personnage en PNG/GIF, décor en PNG/GIF/MP4.
- **Formats de sortie** : 1920×1080 (16:9), 1080×1920 (9:16), 1080×1350 (4:5), 1080×1080 (1:1), 1440×1080 (4:3), 2560×1080 (21:9) ou personnalisé.
- **Personnage** : nom, position X/Y, échelle, miroir horizontal, animation idle (respiration, flottement, rebond, balancement) avec vitesse et intensité.
- **Boîte de dialogue** : presets NES Classic, SNES RPG, PS1 JRPG, Game Boy, Visual Novel, Retro Terminal, Kawaii Cutecore ; position, taille, opacité, padding, arrondi, typographie et couleurs réglables.
- **FX & post-prod** : scanlines CRT, vignette, glitch, aberration chromatique, grain, bloom, pixelisation, color grading (température, saturation, contraste, luminosité).
- **Lecture** : effet typewriter (vitesse en ms/caractère), transitions entre lignes (instantané, fondu, glisser), défilement automatique avec pause réglable.
- **Profils** : sauvegarde locale (localStorage) et export / import en JSON.
- **Export** : capture PNG à la résolution du format de sortie, enregistrement vidéo (WebM, ou MP4 selon le navigateur) avec les effets appliqués.

## Installation

Prérequis : [Node.js](https://nodejs.org) 18+.

```bash
# Installer les dépendances
npm install

# Lancer le serveur de dev
npm run dev
```

L'app s'ouvre automatiquement dans le navigateur sur `http://localhost:3000`.

### Build production

```bash
npm run build
npm run preview
```

Le build se trouvera dans `dist/`.

## Utilisation

1. **Upload** un PNG/GIF pour le personnage et un PNG/GIF/MP4 pour le background.
2. **Configure** le nom, la position, le style de dialogue box.
3. **Écris** les lignes de dialogue dans l'éditeur (**Entrée** ajoute la ligne).
4. **Play** pour lancer l'animation typewriter.
5. **Click** sur l'output ou **NEXT** pour avancer.
6. **Screenshot** pour exporter en PNG (1920×1080 par défaut, selon le format de sortie choisi), ou **Enregistrer vidéo** pour capturer l'animation.

## Structure du projet

```
index.html          Interface (onglets Assets, Personnage, Dialogue Box, FX, Lecture)
vite.config.js      Config Vite (port 3000, sortie dist/)
src/
  main.js           Point d'entrée, câblage de l'interface
  state.js          État global de l'application
  renderer.js       Rendu de la scène et formats de sortie
  dialogue.js       Gestion des lignes de dialogue
  typewriter.js     Effet machine à écrire
  animations.js     Animations idle du personnage
  presets.js        Presets de boîtes de dialogue
  profiles.js       Profils (localStorage, import/export JSON)
  fx.js             Effets visuels
  captureFX.js      Post-traitement des effets sur le canvas exporté
  screenshot.js     Export PNG
  recorder.js       Enregistrement vidéo
  tabs.js           Navigation par onglets
  styles/           Feuilles de style (main, tabs, controls, scene, crt, animations)
```

## Stack technique

JavaScript (modules ES), Vite 5, html2canvas, MediaRecorder, Google Fonts (Press Start 2P, VT323, Nunito).

## Crédits & licence

Bibliothèque : [html2canvas](https://html2canvas.hertzen.com/). Polices : Press Start 2P, VT323 et Nunito via Google Fonts.

Aucune licence n'est spécifiée — tous droits réservés.

---

<p align="center">
  Fait par <a href="https://github.com/elisalien">Élisalien</a> ·
  <a href="https://gitlab.com/elisalien/catalog">Catalogue des shaders, sources & logiciels</a>
</p>
