const MINIMUM_DAMAGE_PERCENTAGE = 80;
const MINIMUM_DEFENCE_PERCENTAGE = 70;
const MINIMUM_SKILL_PERCENTAGE = 90;
const MINIMUM_SKILL_DEFENCE_PERCENTAGE = 90;

function checkIfSuccessful(percentChance) {
  return Math.random() * 100 < percentChance;
}

function skillNotUseableInBattle(skill) {
  return !(skill.collections.includes('use:battle') || skill.collections.includes('use:all'));
}

function skillNotUseableOutsideBattle(skill) {
  return !(skill.collections.includes('use:all') || skill.collections.includes('use:world'));
}

function calculateSkillDamage(skillDamage, skillDefence = 0) {
  const randomizer = Math.max(Math.random() * 100, MINIMUM_SKILL_PERCENTAGE) / 100;
  const randomizer2 = Math.max(Math.random() * 100, MINIMUM_SKILL_DEFENCE_PERCENTAGE) / 100;
  const damage = Math.floor((skillDamage * randomizer) - (skillDefence * randomizer2));
  return damage;
}

function calculateSkillEffect({attacker, defender = null, skill}) {
  const level = skill.level;
  const levelMultiplier = skill.levels[level].multiplier;
  const manaCost = Math.ceil(skill.cost * levelMultiplier);
  let skillStatsTotal = 0;
  Object.entries(skill.requirements).forEach(([stat, _]) => {
    skillStatsTotal += attacker.stats[stat];
  });
  const baseDamage = skill.attributes.vitals.health;
  const maxDamage = Math.ceil(baseDamage * skillStatsTotal * levelMultiplier);
  let skillDefence = 0;
  if (defender) {
    skillDefence = skill.type === 'magic' ? defender.stats.magic : defender.stats.defence;
  }

  return { maxDamage, skillDefence, manaCost};
}

export {
  MINIMUM_DAMAGE_PERCENTAGE,
  MINIMUM_DEFENCE_PERCENTAGE,
  checkIfSuccessful,
  skillNotUseableInBattle,
  skillNotUseableOutsideBattle,
  calculateSkillEffect,
  calculateSkillDamage
}