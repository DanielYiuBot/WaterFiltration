/* ============================================================
   scoring.js – ClearWater Lab  Physics-Based Scoring Engine
   ============================================================ */

/**
 * IDEAL top-to-bottom order: gravel → sand → carbon → cotton
 *
 * Each material has:
 *   turbidityReduction  – percentage points removed from turbidity (0-100)
 *   odorReduction       – percentage points removed from odor     (0-100)
 *   idealPosition       – preferred index from top (0 = topmost)
 *   flowResistance      – base flow resistance (higher = slower)
 */
const MATERIAL_STATS = {
  gravel: { turbidityReduction: 30, odorReduction: 0,  idealPosition: 0, flowResistance: 1 },
  sand:   { turbidityReduction: 40, odorReduction: 0,  idealPosition: 1, flowResistance: 3 },
  carbon: { turbidityReduction: 10, odorReduction: 80, idealPosition: 2, flowResistance: 2 },
  cotton: { turbidityReduction: 15, odorReduction: 0,  idealPosition: 3, flowResistance: 2 },
};

/** Scenario starting conditions */
const SCENARIO_INITIAL = {
  A: { turbidity: 100, odor: 10,  name: 'river'  },   // river: high turbidity, low odor
  B: { turbidity: 80,  odor: 100, name: 'pond'   },   // pond: moderate turbidity, very high odor
};

/**
 * Compute the filter results given a scenario and an array of layer names
 * (ordered top-to-bottom, i.e. layers[0] is the TOPMOST material).
 *
 * @param {string} scenario – 'A' or 'B'
 * @param {string[]} layers – e.g. ['gravel','sand','carbon','cotton']
 * @returns {{ scenario, layers, turbidity, clarity, odor, odorLevel, flowTime, clogged, score }}
 */
function computeFilterResult(scenario, layers) {
  const init = SCENARIO_INITIAL[scenario] || SCENARIO_INITIAL.A;

  let turbidity = init.turbidity;  // 0 = perfectly clear, 100 = opaque
  let odor      = init.odor;       // 0 = no smell, 100 = very strong

  /* --- 1. Check for clogging ---- */
  const clogged = isClogged(layers);

  if (clogged) {
    // Water can barely pass – almost no filtering, very slow
    return {
      scenario,
      layers: [...layers],
      turbidity: Math.max(turbidity - 5, 0),
      clarity: Math.min(5 + (100 - turbidity), 100),
      odor,
      odorLevel: odorToLevel(odor),
      flowTime: 999,          // effectively stuck
      clogged: true,
      score: 5,
    };
  }

  /* --- 2. Turbidity & odor reduction --- */
  for (const mat of layers) {
    const stats = MATERIAL_STATS[mat];
    if (!stats) continue;
    turbidity = Math.max(turbidity - stats.turbidityReduction, 0);
    odor      = Math.max(odor - stats.odorReduction, 0);
  }

  const clarity = 100 - turbidity;   // 0-100  (higher = clearer)

  /* --- 3. Flow time --- */
  let baseFlow = 3; // seconds base
  for (const mat of layers) {
    const stats = MATERIAL_STATS[mat];
    if (stats) baseFlow += stats.flowResistance;
  }
  // Order penalty: if materials are badly ordered, flow is slower
  const orderPenalty = computeOrderPenalty(layers);
  const flowTime = +(baseFlow + orderPenalty).toFixed(1);

  /* --- 4. Score --- */
  const score = computeScore(scenario, layers, clarity, odor, orderPenalty);

  const result = {
    scenario,
    layers: [...layers],
    turbidity,
    clarity,
    odor,
    odorLevel: odorToLevel(odor),
    flowTime,
    clogged: false,
    score,
  };

  /* ---- Debug logging ---- */
  console.group('%c[Scoring] Filter Result', 'color:#039BE5;font-weight:bold');
  console.log('Scenario:', scenario);
  console.log('Layers (top→bottom):', layers.join(' → '));
  console.log(`Turbidity: ${init.turbidity} → ${turbidity}  |  Clarity: ${clarity}%`);
  console.log(`Odor: ${init.odor} → ${odor}  (${result.odorLevel})`);
  console.log(`Flow: ${flowTime}s  (base ${baseFlow - orderPenalty}s + penalty ${orderPenalty}s)`);
  console.log(`Score: ${score}/100`);
  console.table({
    clarity: { value: `${clarity}%`, pts: +((clarity / 100) * 40).toFixed(1) },
    odor:    { value: `${odor}`,     pts: +(((100 - odor) / 100) * (scenario === 'B' ? 30 : 10)).toFixed(1) },
    order:   { value: `penalty ${orderPenalty}s`, pts: layers.length >= 2 ? +Math.max(0, 20 - (orderPenalty / ((layers.length - 1) * 2 + 1.5)) * 20).toFixed(1) : 0 },
    completeness: { value: `${new Set(layers).size}/${scenario === 'B' ? 4 : 3} materials`, pts: +(Math.min(new Set(layers).size / (scenario === 'B' ? 4 : 3), 1) * 10).toFixed(1) },
  });
  console.groupEnd();

  return result;
}

/**
 * Detect severe clogging:
 * Cotton directly on top (very fine fibres) receiving raw dirty water → clogs.
 * Sand on top is suboptimal (handled by flow penalty) but doesn't fully clog.
 */
function isClogged(layers) {
  if (layers.length === 0) return false;
  const top = layers[0];
  // Only cotton on top causes actual clogging (fibres saturate instantly)
  if (top === 'cotton' && layers.length >= 2) {
    return true;
  }
  return false;
}

/**
 * Compute an order penalty (seconds added to flow).
 * Ideal: gravel(0) → sand(1) → carbon(2) → cotton(3)
 * For each adjacent pair where a finer material is above a coarser one, add penalty.
 * Sand on top (without gravel above) adds extra flow resistance.
 */
function computeOrderPenalty(layers) {
  let penalty = 0;

  // Sand on very top → slow intake (not clog, but significant penalty)
  if (layers.length >= 2 && layers[0] === 'sand') {
    penalty += 1.5;
  }

  // Adjacent-pair inversion penalty (works for any number of layers)
  for (let i = 0; i < layers.length - 1; i++) {
    const a = MATERIAL_STATS[layers[i]];
    const b = MATERIAL_STATS[layers[i + 1]];
    if (a && b && a.idealPosition > b.idealPosition) {
      penalty += 2;  // each inversion adds 2s
    }
  }
  return penalty;
}

/** Convert odor 0-100 into a discrete level */
function odorToLevel(odor) {
  if (odor >= 50) return 'strong';
  if (odor >= 15) return 'medium';
  return 'none';
}

/**
 * Compute a 0-100 score.
 *   - Clarity contributes up to 40 pts
 *   - Odor handling contributes up to 30 pts (weighted more for scenario B)
 *   - Order correctness contributes up to 20 pts  (requires ≥2 layers)
 *   - Layer completeness contributes up to 10 pts
 *
 * Partial stacks are handled gracefully:
 *   - 0 layers → score 0
 *   - 1 layer  → order score = 0  (no ordering to evaluate)
 *   - 2-3 layers → order score scaled to actual # of pairs
 */
function computeScore(scenario, layers, clarity, odor, orderPenalty) {
  if (layers.length === 0) return 0;

  // Clarity score (0-40)
  const clarityScore = (clarity / 100) * 40;

  // Odor score (0-30) – for scenario A odor matters less
  const odorWeight = scenario === 'B' ? 30 : 10;
  const odorScore = ((100 - odor) / 100) * odorWeight;

  // Order score (0-20) – need at least 2 layers to evaluate ordering
  let orderScore = 0;
  if (layers.length >= 2) {
    // Max possible penalty = 2 per adjacent pair + 1.5 if sand on top
    const pairCount = layers.length - 1;
    const maxPenalty = pairCount * 2 + 1.5;
    orderScore = Math.max(0, 20 - (orderPenalty / maxPenalty) * 20);
  }

  // Completeness (0-10) – did student use enough materials?
  const uniqueMats = new Set(layers);
  const idealCount = scenario === 'B' ? 4 : 3; // B needs carbon
  const completeness = Math.min(uniqueMats.size / idealCount, 1) * 10;

  const total = Math.round(clarityScore + odorScore + orderScore + completeness);
  return Math.min(total, 100);
}

/* ---------- Exports ---------- */
window.Scoring = {
  computeFilterResult,
  MATERIAL_STATS,
  SCENARIO_INITIAL,
};
