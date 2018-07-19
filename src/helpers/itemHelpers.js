import { generateStat, calculatePercentagePoint } from './misc';
import allItems from '../assets/data/items.json';

// Non-exported stuff
const EQUIPMENT_TYPES = ['weapon', 'armor', 'helmet', 'boots', 'shield'];
const STATS = ['strength', 'dexterity', 'agility', 'magic', 'vitality'];
const WILL_CALCULATE = [...STATS, 'attack', 'defence'];
const MAX_UPGRADE_MULTIPLIER = 1.2;

// Item costs (for increasing item price after upgrades)
const COST_PER_ATTACK_POINT = 25;
const COST_PER_ATTACK_POINT_2_HANDS = 20;
const COST_PER_STAT_POINT = 50;
const COST_PER_STAT_POINT_2_HANDS = 45;
const COST_PER_DEFENCE_POINT = 50;

function isEquipment(item) {
  return EQUIPMENT_TYPES.includes(item.type);
}

function isTwoHanded(item) {
  return item.collections.includes('two-handed');
}

function consumableInBattle(item) {
  return item.collections.includes('use:all') || item.collections.includes('use:battle');
}

function consumableInWorld(item) {
  return item.collections.includes('use:all') || item.collections.includes('use:world');
}

function canBeTreasure(item) {
  return !item.collections.includes('no-treasure');
}

function canBePurchased(item) {
  return item.collections.includes('buy');
}

function canBeSold(item) {
  return item.collections.includes('sell');
}

function isStartingItem(item) {
  return item.collections.includes('starting-item');
}

function alwaysSold(item) {
  return item.collections.includes('basic-needs');
}

function calculateUpgradePrice(item) {
  const baseItem = allItems.find((baseItem) => baseItem.id === item.id);
  // Return false if item is not upgradable
  if (!baseItem || !baseItem.attributes || !item.attributes) { return false; }
  if (!Object.keys(item.attributes).some((stat) => WILL_CALCULATE.includes(stat))) { return false; }
  // Calculate price to upgrade
  let upgradePrice = 0;
  Object.entries(baseItem.attributes).forEach(([name, values]) => {
    const normalMax = values[1];
    const maxValue = Math.ceil(normalMax * MAX_UPGRADE_MULTIPLIER);
    const currentVal = item.attributes[name];
    let statPrice = 0;
    if (currentVal < maxValue) {
      if (STATS.includes(name)) {
        statPrice = isTwoHanded(baseItem) ? COST_PER_STAT_POINT_2_HANDS : COST_PER_STAT_POINT;
      } else if (name === 'attack') {
        statPrice = isTwoHanded(baseItem) ? COST_PER_ATTACK_POINT_2_HANDS : COST_PER_ATTACK_POINT;
      } else if (name === 'defence') {
        statPrice = COST_PER_DEFENCE_POINT;
      }
    }
    if (currentVal >= normalMax) {
      upgradePrice += Math.ceil(statPrice * (MAX_UPGRADE_MULTIPLIER * 1.5));
    } else {
      upgradePrice += Math.ceil(statPrice * MAX_UPGRADE_MULTIPLIER);
    }
  });

  // Return -1 for a maxxed out item
  return upgradePrice > 0 ? upgradePrice : -1;
}

function applyItemUpgrade(item) {
  const baseItem = allItems.find((baseItem) => baseItem.id === item.id);
  const valueIncrease = calculateUpgradePrice(item) / 1.5;
  // Apply 1 point upgrade to stats (as long as they have room to upgrade)
  Object.entries(item.attributes).forEach(([name, _]) => {
    const maxValue = Math.ceil(baseItem.attributes[name][1] * MAX_UPGRADE_MULTIPLIER);
    if (item.attributes[name] < maxValue) {
      item.attributes[name] += 1;
    }
  });
  item.price += valueIncrease;
  return item;
}

function getEquipmentSummary(hero) {
  const heroEquipment = hero.equipment;
  const stats = {};
  EQUIPMENT_TYPES.forEach((item) => {
    if (heroEquipment[item]) {
      Object.entries(heroEquipment[item].attributes).forEach(([stat, value]) => {
        if (stats[stat]) {
          stats[stat] += value;
        } else {
          stats[stat] = value;
        }
      });
    }
  });

  return stats;
}

function getShopItems({shopType, quantity = 15, minLevel = 1, maxLevel = 10}) {
  let possibleItems = null;
  let basicItems = null;
  let extraItems = [];
  let possibleItemsLength = 0;
  let possibleExtraItems = null;
  if (shopType === 'blacksmith') {
    possibleItems = allItems.filter((item) => {
      return isEquipment(item) && canBePurchased(item) && (item.level >= minLevel && item.level <= maxLevel);
    });
    possibleItemsLength = possibleItems.length;
    if (possibleItemsLength === 0) { return []; }
    possibleExtraItems = Array.from({length: quantity}, () => {
      const randomNumber = Math.floor(Math.random() * possibleItemsLength);
      return populateItemStats(JSON.parse(JSON.stringify(possibleItems[randomNumber])));
    });
    return possibleExtraItems;
  } else {
    basicItems = allItems.filter(alwaysSold);
    if (basicItems.length >= quantity) {
      return basicItems;
    }
    possibleItems = allItems.filter((item) => {
      return !isEquipment(item) && canBePurchased(item) && (item.level >= minLevel && item.level <= maxLevel);
    });
    possibleItemsLength = possibleItems.length;
    if (possibleItemsLength + basicItems.length === 0) {
      return []; 
    } else if (possibleItemsLength === 0) {
      return basicItems;
    }
    possibleExtraItems = Array.from({length: quantity - basicItems.length}, () => {
      const randomNumber = Math.floor(Math.random() * possibleItemsLength);
      return populateItemStats(JSON.parse(JSON.stringify(possibleItems[randomNumber])));
    });
    // Make sure things are unique
    possibleExtraItems.forEach((pitem) => {
      if (extraItems.findIndex((item) => item.id === pitem.id) === -1
        && basicItems.findIndex((item) => item.id === pitem.id) === -1) {
        extraItems.push(pitem);
      }
    });
    return [...basicItems, ...extraItems];
  }
}

function populateItemStats(item) {
  if (item.attributes) {
    let minPoints = 0;
    let maxPoints = 0;
    let currentPoints = 0;
    Object.entries(item.attributes).forEach(([name, value]) => {
      if (Array.isArray(value)) {
        minPoints += value[0];
        maxPoints += value[1] || value[0];
        const generatedValue = generateStat(value);
        currentPoints += generatedValue;
        item.attributes[name] = generatedValue;
      }
    });
    const percentage = Math.ceil(((currentPoints - minPoints) / (maxPoints - minPoints) * 100)) || 0;
    item.price = calculatePercentagePoint(item.price, percentage);
  } else {
    item.price = generateStat(item.price);
  }
  return item;
}

  // Returns an item with given id or name
  function getItem(nameOrId) {
    let item = null;
    const id = parseInt(nameOrId, 10);
    if (isNaN(id)) {
      item = allItems.find((item) => item.name === nameOrId);
    } else {
      item = allItems.find((item) => item.id === id);
    }
    // Duplicate object so we avoid any funkiness
    return item ? JSON.parse(JSON.stringify(item)) : undefined;
  }

  function calculateSellingPrice(item) {
    return Math.floor(item.price / 1.5);
  }

export {
  isEquipment,
  consumableInBattle,
  consumableInWorld,
  canBeTreasure,
  canBePurchased,
  canBeSold,
  isStartingItem,
  populateItemStats,
  getItem,
  getEquipmentSummary,
  isTwoHanded,
  calculateSellingPrice,
  calculateUpgradePrice,
  applyItemUpgrade,
  getShopItems,
};