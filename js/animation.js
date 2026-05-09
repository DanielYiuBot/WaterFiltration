/* ============================================================
  animation.js – ClearWater Lab V2 Animations
  ============================================================ */

const WATER_COLORS = {
  dirty: 'rgba(93, 64, 55, 0.85)',
  clean: 'rgba(173, 216, 245, 0.35)',
};

async function runFilterAnimation(layers, result) {
  const bottle = document.getElementById('bottle');
  const reservoir = document.getElementById('water-reservoir');
  const beaker = document.getElementById('beaker-water');

  if (result.clogged) {
    await animateClog(bottle, reservoir);
    return;
  }

  const totalDuration = Math.min(result.flowTime * 0.72, 10) * 1000;
  const flowColumn = document.createElement('div');
  flowColumn.className = 'bottle-flow-column';
  const stream = document.createElement('div');
  stream.className = 'bottle-filter-stream';
  stream.style.animationDuration = `${Math.max(0.7, result.flowTime / 2)}s`;
  bottle.appendChild(flowColumn);
  bottle.appendChild(stream);

  reservoir.style.transition = 'none';
  reservoir.classList.remove('filtered');
  reservoir.style.background = 'linear-gradient(180deg, #5D4037 0%, #795548 60%, #8D6E63 100%)';

  beaker.style.background = interpolateColor(WATER_COLORS.dirty, WATER_COLORS.clean, result.clarity / 100);
  beaker.style.transition = `height ${totalDuration}ms linear, background ${totalDuration}ms ease`;
  requestAnimationFrame(() => {
    flowColumn.classList.add('running');
    stream.classList.add('running');
    beaker.style.height = '70%';
  });

  await sleep(totalDuration);
  flowColumn.remove();
  stream.remove();
  await sleep(300);
}

async function runTask1ParallelDemo(resultsByMaterial) {
  const cards = [...document.querySelectorAll('#task1-filters .mini-filter')];
  const startTime = Date.now();
  const completion = [];

  cards.forEach((card) => {
    const water = card.querySelector('.mini-water');
    const stream = card.querySelector('.mini-filter-stream');
    const score = card.querySelector('.mini-score');
    card.classList.remove('running', 'complete');
    if (water) {
      water.style.height = '0%';
      water.className = 'mini-water';
    }
    if (stream) stream.style.animationDuration = '';
    if (score) {
      score.classList.add('hidden');
      score.textContent = '';
    }
  });

  await Promise.all(cards.map(async (card) => {
    const material = card.dataset.material;
    const result = resultsByMaterial[material];
    if (!result) return;

    const durationMs = Math.round(result.flowTime * 1000);
    const water = card.querySelector('.mini-water');
    const stream = card.querySelector('.mini-filter-stream');
    const score = card.querySelector('.mini-score');
    if (!water || !score) return;

    water.classList.add(`mini-water-${material}`);
    card.classList.add('running');
    if (stream) stream.style.animationDuration = `${Math.max(0.7, result.flowTime / 2)}s`;
    water.style.transition = `height ${durationMs}ms linear`;
    requestAnimationFrame(() => {
      water.style.height = '100%';
    });

    await sleep(durationMs);

    score.textContent = `${I18n.t('clarityLabel')} ${result.clarity}% | ${I18n.t('speedLabel')} ${result.flowTime}${I18n.t('seconds')}`;
    score.classList.remove('hidden');

    completion.push({
      material,
      clarity: result.clarity,
      flowTime: result.flowTime,
      finishedAtOffsetMs: Date.now() - startTime,
    });
    card.classList.remove('running');
    card.classList.add('complete');
  }));

  return completion.sort((a, b) => a.finishedAtOffsetMs - b.finishedAtOffsetMs);
}

async function animateClog(bottle, reservoir) {
  const overlay = document.createElement('div');
  overlay.className = 'clog-overlay';
  overlay.innerHTML = `<span>${I18n.t('clogWarning')}</span>`;
  bottle.appendChild(overlay);

  reservoir.style.transition = 'background 3s ease';
  reservoir.style.background = interpolateColor(WATER_COLORS.dirty, WATER_COLORS.clean, 0.08);
  await sleep(2500);
  setTimeout(() => overlay.remove(), 2000);
}

function animateDropThroughLayer(layerEl, color, duration) {
  return new Promise((resolve) => {
    const drop = document.createElement('div');
    drop.className = 'water-drop';
    drop.style.background = color;
    layerEl.style.position = 'relative';
    layerEl.appendChild(drop);

    const anim = drop.animate(
      [{ top: '-14px', opacity: 0.9 }, { top: 'calc(100% + 14px)', opacity: 0.5 }],
      { duration, easing: 'ease-in-out', fill: 'forwards' }
    );

    anim.onfinish = () => {
      drop.remove();
      resolve();
    };
  });
}

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

function parseRgba(str) {
  const m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (!m) return null;
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function resetAnimation() {
  const reservoir = document.getElementById('water-reservoir');
  const beaker = document.getElementById('beaker-water');
  const bottle = document.getElementById('bottle');

  bottle.querySelectorAll('.clog-overlay').forEach((el) => el.remove());
  bottle.querySelectorAll('.bottle-flow-column, .bottle-filter-stream').forEach((el) => el.remove());
  reservoir.classList.remove('filtered');
  reservoir.style.transition = 'none';
  reservoir.style.background = '';
  void reservoir.offsetHeight;
  reservoir.className = 'water-reservoir scenario-A';

  beaker.style.transition = 'none';
  beaker.style.height = '0';
  beaker.style.background = 'transparent';
  void beaker.offsetHeight;
  beaker.style.transition = '';
}

window.Animation = {
  runFilterAnimation,
  runTask1ParallelDemo,
  resetAnimation,
  WATER_COLORS,
  sleep,
};
