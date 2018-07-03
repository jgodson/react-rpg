function checkIfSuccessful(percentChance) {
  return Math.random() * 100 < percentChance;
}

export {
  checkIfSuccessful,
}