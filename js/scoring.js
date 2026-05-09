/* ============================================================
  scoring.js – ClearWater Lab V2 Scoring Engine
  ============================================================ */

const MATERIAL_STATS = {
  gravel: { turbidityReduction: 28, flowResistance: 1.2, gapRank: 4 },
  pebble: { turbidityReduction: 22, flowResistance: 1.6, gapRank: 3 },
  sand: { turbidityReduction: 36, flowResistance: 3.1, gapRank: 2 },
  cotton: { turbidityReduction: 18, flowResistance: 2.4, gapRank: 1 },
};

const TASK2_INITIAL = { turbidity: 100, name: 'muddy-river' };

function computeFilterResult(layers) {
  const turbidityStart = TASK2_INITIAL.turbidity;
  let turbidity = turbidityStart;

  const clogged = isClogged(layers);
  if (clogged) {
    return {
      task: 'task2',
      layers: [...layers],
      turbidity: 95,
      clarity: 5,
      flowTime: 999,
      clogged: true,
      score: 5,
    };
  }

  for (const mat of layers) {
    const stats = MATERIAL_STATS[mat];
    if (!stats) continue;
    turbidity = Math.max(0, turbidity - stats.turbidityReduction);
  }

  const clarity = 100 - turbidity;
  const orderPenalty = computeOrderPenalty(layers);
  const baseFlow = layers.reduce((sum, mat) => {
    const stats = MATERIAL_STATS[mat];
    return sum + (stats ? stats.flowResistance : 0);
  }, 2.8);
  const flowTime = +(baseFlow + orderPenalty).toFixed(1);
  const score = computeScore(layers, clarity, flowTime, orderPenalty);

  return {
    task: 'task2',
    layers: [...layers],
    turbidity,
    clarity,
    flowTime,
    clogged: false,
    score,
  };
}

function isClogged(layers) {
  if (layers.length < 2) return false;
  return layers[0] === 'cotton';
}

function computeOrderPenalty(layers) {
  let penalty = 0;
  for (let i = 0; i < layers.length - 1; i++) {
    const top = MATERIAL_STATS[layers[i]];
    const below = MATERIAL_STATS[layers[i + 1]];
    if (top && below && top.gapRank < below.gapRank) {
      penalty += 1.8;
    }
  }
  return penalty;
}

function computeScore(layers, clarity, flowTime, orderPenalty) {
  if (layers.length === 0) return 0;
  const clarityScore = (clarity / 100) * 55;
  const speedScore = Math.max(0, 25 - Math.max(flowTime - 4, 0) * 2.2);
  const orderScore = Math.max(0, 15 - orderPenalty * 3);
  const useAllBonus = new Set(layers).size >= 3 ? 5 : 0;
  return Math.min(100, Math.round(clarityScore + speedScore + orderScore + useAllBonus));
}

function getTask1MaterialDemoResult(material) {
  const map = {
    gravel: { clarity: 42, flowTime: 2.4 },
    pebble: { clarity: 55, flowTime: 3.1 },
    sand: { clarity: 76, flowTime: 4.6 },
    cotton: { clarity: 63, flowTime: 5.2 },
  };
  return map[material] || { clarity: 40, flowTime: 3.5 };
}

window.Scoring = {
  computeFilterResult,
  MATERIAL_STATS,
  TASK2_INITIAL,
  getTask1MaterialDemoResult,
};
