import { generateStat, calculatePercentagePoint } from './misc';
import allItems from '../assets/data/items.json';

const EQUIPMENT_TYPES = ['weapon', 'armor', 'helmet', 'boots', 'shield'];

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
};