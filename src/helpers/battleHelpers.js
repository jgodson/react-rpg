const MINIMUM_DAMAGE_PERCENTAGE = 80;
const MINIMUM_DEFENCE_PERCENTAGE = 70;

function checkIfSuccessful(percentChance) {
  return Math.random() * 100 < percentChance;
}

export {
  MINIMUM_DAMAGE_PERCENTAGE,
  MINIMUM_DEFENCE_PERCENTAGE,
  checkIfSuccessful,
}