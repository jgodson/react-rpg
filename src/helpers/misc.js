import statsMap from '../assets/data/statsMap.json';

function generateStat([min, max]) {
  if (!max) { return min; }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculatePercentagePoint([min, max], percentage) {
  if (!max) { return min; }
  return Math.floor((max - min) * (percentage) * 0.01 + min);
}

function calculateAttack(stats) {
  let attack = null;

  Object.entries(stats).forEach(([name, value]) => {
    if (statsMap[name]) {
      attack += (statsMap[name]['attack'] || 0) * value;
    }
  });

  return attack;
}

function calculateVitals(stats) {
  let health = 0;
  let mana = 0;

  Object.entries(stats).forEach(([name, value]) => {
    if (statsMap[name]) {
      health += (statsMap[name]['health'] || 0) * value;
      mana += (statsMap[name]['mana'] || 0) * value;
    }
  });

  return {
    health,
    mana,
  };
}

export {
  generateStat,
  calculatePercentagePoint,
  calculateAttack,
  calculateVitals,
};