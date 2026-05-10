/* ============================================================
  scoring.js – ClearWater Lab V2 Scoring Engine
  ============================================================ */

const MATERIAL_STATS = {
  gravel: { turbidityReduction: 28, flowResistance: 1.2, gapRank: 4 },
  coarseSand: { turbidityReduction: 22, flowResistance: 1.6, gapRank: 3 },
  sand: { turbidityReduction: 36, flowResistance: 3.1, gapRank: 2 },
  cotton: { turbidityReduction: 18, flowResistance: 2.4, gapRank: 1 },
};

const TASK2_INITIAL = { turbidity: 100, name: 'muddy-river' };

// Exact outcomes for the three reference stacks from teaching materials.
// layers[] order is top → bottom (first drop lands at bottom; addLayer uses unshift).
const TASK2_VARIANT_KEYS = {
  A: 'cotton>sand>coarseSand>gravel',
  B: 'coarseSand>sand>gravel>cotton',
  C: 'gravel>coarseSand>sand>cotton',
};

function classifyTask2Variant(layers) {
  if (!layers || layers.length !== 4) return null;
  const key = layers.join('>');
  if (key === TASK2_VARIANT_KEYS.A) return 'A';
  if (key === TASK2_VARIANT_KEYS.B) return 'B';
  if (key === TASK2_VARIANT_KEYS.C) return 'C';
  return null;
}

const TASK2_EXAMPLE_RESULTS = {
  // C：gravel→…→cotton（與工作紙方法 C；清澈度較佳）
  'gravel>coarseSand>sand>cotton': {
    clarity: 90,
    flowTime: 70,
    scienceExplanation: '過濾效果：水最清澈。濾材由大空隙到小空隙，能逐步阻擋不同大小雜質。',
  },
  // B：由上而下 粗砂粒→幼砂粒→石頭→棉花
  'coarseSand>sand>gravel>cotton': {
    clarity: 65,
    flowTime: 80,
    scienceExplanation: '過濾效果：水較混濁。次序未完全由大到小，清澈度與流速居中。',
  },
  // A：cotton→…→gravel（與工作紙方法 A；清澈度較差）
  'cotton>sand>coarseSand>gravel': {
    clarity: 40,
    flowTime: 120,
    scienceExplanation: '過濾效果：水最混濁。細小空隙濾材在下方時較易堵塞，泥沙較難順序阻擋。',
  },
};

function computeFilterResult(layers) {
  const turbidityStart = TASK2_INITIAL.turbidity;
  let turbidity = turbidityStart;
  const task2Variant = classifyTask2Variant(layers);

  const exampleResult = getTask2ExampleResult(layers);
  if (exampleResult) return { ...exampleResult, task2Variant };

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
      scienceExplanation: '濾材堵塞，請調整順序',
      task2Variant: null,
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
    scienceExplanation: getFallbackScienceExplanation(layers, orderPenalty),
    task2Variant,
  };
}

function getTask2ExampleResult(layers) {
  const key = layers.join('>');
  const result = TASK2_EXAMPLE_RESULTS[key];
  if (!result) return null;

  return {
    task: 'task2',
    layers: [...layers],
    turbidity: 100 - result.clarity,
    clarity: result.clarity,
    flowTime: result.flowTime,
    clogged: false,
    score: result.clarity,
    scienceExplanation: result.scienceExplanation,
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

function getFallbackScienceExplanation(layers, orderPenalty) {
  if (layers.length === 0) return '';
  if (orderPenalty > 0) {
    return '排列未能完全由大空隙到小空隙，部分雜質可能較難逐層阻擋';
  }
  return '濾材排列較接近由大空隙到小空隙，可逐步阻擋不同大小的雜質';
}

function getTask1MaterialDemoResult(material) {
  const map = {
    gravel: { clarity: 42, flowTime: 10, demoDuration: 2.4 },
    coarseSand: { clarity: 55, flowTime: 17, demoDuration: 3.1 },
    sand: { clarity: 76, flowTime: 80, demoDuration: 4.6 },
    cotton: { clarity: 63, flowTime: 120, demoDuration: 5.2 },
  };
  return map[material] || { clarity: 40, flowTime: 10, demoDuration: 3.5 };
}

window.Scoring = {
  computeFilterResult,
  classifyTask2Variant,
  MATERIAL_STATS,
  TASK2_INITIAL,
  TASK2_EXAMPLE_RESULTS,
  TASK2_VARIANT_KEYS,
  getTask1MaterialDemoResult,
};
