/* ============================================================
   animation.js – ClearWater Lab  Water Flow & Color Animation
   ============================================================ */

/**
 * Color palette for water at different purity levels.
 * We interpolate between dirty → clean.
 */
const WATER_COLORS = {
  A: {
    dirty: 'rgba(93, 64, 55, 0.85)',      // muddy brown
    mid:   'rgba(160, 130, 100, 0.55)',
    clean: 'rgba(173, 216, 245, 0.35)',    // clear blue tint
  },
  B: {
    dirty: 'rgba(51, 105, 30, 0.80)',      // algae green
    mid:   'rgba(120, 170, 80, 0.50)',
    clean: 'rgba(173, 216, 245, 0.35)',
  },
};

/**
 * Run the full filtration animation.
 *
 * @param {string}   scenario – 'A' or 'B'
 * @param {string[]} layers   – material names top→bottom
 * @param {object}   result   – output of Scoring.computeFilterResult
 * @returns {Promise} resolves when animation is complete
 */
async function runFilterAnimation(scenario, layers, result) {
  const bottle    = document.getElementById('bottle');
  const reservoir = document.getElementById('water-reservoir');
  const beaker    = document.getElementById('beaker-water');
  const layerEls  = [...document.querySelectorAll('#bottle-layers .filter-layer')];

  // Reverse layerEls so index 0 = topmost visual layer
  // (they are rendered bottom-up in CSS column-reverse, but DOM order is bottom-first)
  const topToBottom = [...layerEls].reverse();

  const colors = WATER_COLORS[scenario] || WATER_COLORS.A;

  /* --- Handle clog --- */
  if (result.clogged) {
    await animateClog(bottle, reservoir, colors);
    return;
  }

  /* --- Normal flow --- */
  const totalDuration = Math.min(result.flowTime, 15) * 1000; // cap at 15s
  const perLayer = layers.length > 0 ? totalDuration / (layers.length + 1) : totalDuration;

  // 1. Drain reservoir
  reservoir.style.transition = `background ${totalDuration}ms ease`;
  reservoir.classList.add('filtered');

  // 2. Animate drops through each layer
  let currentColor = colors.dirty;
  for (let i = 0; i < topToBottom.length; i++) {
    const progress = (i + 1) / topToBottom.length;
    currentColor = interpolateColor(colors.dirty, colors.clean, progress);
    await animateDropThroughLayer(topToBottom[i], currentColor, perLayer);
  }

  // 3. Fill beaker with output water
  const finalColor = interpolateColorFromClarity(colors, result.clarity);
  beaker.style.background = finalColor;
  beaker.style.height = '70%';

  // Small delay for visual effect
  await sleep(400);
}

/**
 * Animate clog effect – water barely moves, red overlay appears.
 */
async function animateClog(bottle, reservoir, colors) {
  // Show clog overlay
  const overlay = document.createElement('div');
  overlay.className = 'clog-overlay';
  overlay.innerHTML = `<span data-i18n="clogWarning">${I18n.t('clogWarning')}</span>`;
  bottle.appendChild(overlay);

  // Slightly drain reservoir (water is stuck)
  reservoir.style.transition = 'background 3s ease';
  // Just shift color a tiny bit
  reservoir.style.background = shiftColor(colors.dirty, 0.05);

  await sleep(3000);

  // Remove overlay after a moment (user can clear and retry)
  setTimeout(() => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }, 6000);
}

/**
 * Animate a single water drop passing through a layer element.
 */
function animateDropThroughLayer(layerEl, color, duration) {
  return new Promise(resolve => {
    const drop = document.createElement('div');
    drop.className = 'water-drop';
    drop.style.background = color;
    layerEl.style.position = 'relative';
    layerEl.appendChild(drop);

    const anim = drop.animate([
      { top: '-14px', opacity: 0.9 },
      { top: 'calc(100% + 14px)', opacity: 0.5 },
    ], {
      duration: duration,
      easing: 'ease-in-out',
      fill: 'forwards',
    });

    anim.onfinish = () => {
      drop.remove();
      resolve();
    };
  });
}

/* ---------- Color Utilities ---------- */

/**
 * Simple linear interpolation between two rgba color strings.
 * t goes from 0 (colorA) to 1 (colorB).
 */
function interpolateColor(colorA, colorB, t) {
  const a = parseRgba(colorA);
  const b = parseRgba(colorB);
  if (!a || !b) return colorB;

  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  const al = +(a.a + (b.a - a.a) * t).toFixed(2);
  return `rgba(${r}, ${g}, ${bl}, ${al})`;
}

function interpolateColorFromClarity(colors, clarity) {
  const t = clarity / 100;
  return interpolateColor(colors.dirty, colors.clean, t);
}

function shiftColor(color, amount) {
  return interpolateColor(color, 'rgba(200, 220, 240, 0.35)', amount);
}

/** Parse an "rgba(r, g, b, a)" string into {r, g, b, a} */
function parseRgba(str) {
  const m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (!m) return null;
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
}

/** Promisified setTimeout */
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Reset all animation state (reservoir, beaker, overlays).
 */
function resetAnimation(scenario) {
  const reservoir = document.getElementById('water-reservoir');
  const beaker    = document.getElementById('beaker-water');
  const bottle    = document.getElementById('bottle');

  // Remove clog overlays
  bottle.querySelectorAll('.clog-overlay').forEach(el => el.remove());

  // Reset reservoir
  reservoir.classList.remove('filtered');
  reservoir.style.transition = 'none';
  reservoir.style.background = '';
  // Force reflow
  void reservoir.offsetHeight;
  reservoir.className = 'water-reservoir';
  if (scenario) reservoir.classList.add('scenario-' + scenario);

  // Reset beaker
  beaker.style.transition = 'none';
  beaker.style.height = '0';
  beaker.style.background = 'transparent';
  void beaker.offsetHeight;
  beaker.style.transition = '';
}

/* ---------- Exports ---------- */
window.Animation = {
  runFilterAnimation,
  resetAnimation,
  WATER_COLORS,
  sleep,
};
