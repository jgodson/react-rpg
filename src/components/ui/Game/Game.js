import React from 'react';
import {
  FlexRow,
  Display,
  Stats,
  ActionList,
  Vitals,
} from '../../ui'
import heroLevels from '../../../assets/data/heroLevels';
import statsMap from '../../../assets/data/statsMap';
import levelData from '../../../assets/data/levels';
import allMonsters from '../../../assets/data/monsters';
import { checkIfSuccessful } from '../../../helpers/battleHelpers';
import { 
  populateItemStats,
  getItem,
  getEquipmentSummary,
  isTwoHanded,
  calculateSellingPrice,
  applyItemUpgrade,
  calculateUpgradePrice,
} from '../../../helpers/itemHelpers';
import { 
  generateStat,
  calculatePercentagePoint,
  calculateAttack,
  calculateVitals 
} from '../../../helpers/misc';
import './Game.css';

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    const { gameData } = props;

    if (gameData.gameState === 'creation') {
      const { health, mana } = calculateVitals(gameData.hero.stats);
      const attack = calculateAttack(gameData.hero.stats);

      this.state = {
        ...gameData,
        availableActions: [],
        level: {},
        monstersInLevel: [],
        treasuresInLevel: [],
        lowestLevel: 0,
        hero: {
          ...gameData.hero,
          stats: {
            ...gameData.hero.stats,
            attack,
            health: gameData.hero.stats.health + health,
            mana,
          },
          vitals: {
            ...gameData.hero.vitals,
            health: gameData.hero.stats.health + health,
            mana,
          },
          equipment: {
            ...gameData.hero.equipment,
            backpack: populateBackPackData(getItem(10005)),
          }
        },
        noCombat: false,
        townAction: null,
      };
    } else {
      this.state = gameData;
    }

    function populateBackPackData(backpack) {
      backpack.price = backpack.price[0];
      backpack.attributes.capacity = backpack.attributes.capacity[0];
      return backpack;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.gameState !== prevState.gameState) {
      this.props.changeLocation(this.state.gameState);
    }
  }

  characterCreationCompleted = ({selectedItems, assetInfo, name}) => {
    this.setState({
      gameState: 'town',
      hero: {
        ...this.state.hero,
        name,
        assetInfo: {
          ...assetInfo,
        },
      },
      inventory: [
        ...this.state.inventory,
        ...selectedItems,
      ],
    });
  }

  addItemsToInventory = (items) => {
    this.setState({
      inventory: [
        ...this.state.inventory,
        ...items,
      ],
    });
  }

  transitionToLevel = (name) => {
    const level = levelData[name];
    const monstersInLevel = this.getMonstersForCurrentLevel(level);
    // TODO: treasures
    this.setState({
      level,
      location: {
        x: level.start.x,
        y: level.start.y,
      },
      lowestLevel: level.level,
      monstersInLevel,
      gameState: level ? level.type : this.state.gameState,
    });
  }

  moveMonsters = () => {

  }

  moveTo = (x, y) => {
    this.setState({
      location: {x, y},
      noCombat: false,
    });
  }

  setAvailableActions = (availableActions) => {
    this.setState({
      availableActions,
    });
  }

  getVitals = (character) => this.state[character]['vitals'];

  getStats = (character) => this.state[character]['stats'];

  changeVitals = (character, {health = 0, mana = 0, exp = 0, gold = 0}) => {
    const currentExp = this.state.hero.vitals.exp;
    const nextLevelExp = this.state.hero.stats.nextExpLevel;
    const levelUp = currentExp + exp >= nextLevelExp;
    let newHealth = this.state[character]['vitals']['health'] + health;
    let newMana = this.state[character]['vitals']['mana'] + mana;
    const maxHealth = this.state[character]['stats']['health'];
    const maxMana = this.state[character]['stats']['mana'];

    // Don't allow health or mana to go above maximums
    if (newHealth > maxHealth) {
      newHealth = maxHealth;
    }
    if (newMana > maxMana) {
      newMana = maxMana;
    }

    this.setState({
      ...this.state,
      [character]: {
        ...this.state[character],
        vitals: {
          health: newHealth,
          mana: newMana,
          exp: this.state[character]['vitals']['exp'] + exp,
        },
      },
      inventory: [
        {
          ...this.state.inventory[0],
          quantity: this.state.inventory[0].quantity + gold || 0,
        },
        ...this.state.inventory.slice(1),
      ],
    });

    if (character.indexOf('hero') > -1 && levelUp) {
      this.levelUp(character);
    }
  }

  levelUp = () => {
    const leftoverExp = this.state.hero.vitals.exp - this.state.hero.stats.nextExpLevel;
    const nextLevel = this.state.hero.stats.level + 1;
    let {requiredExp = Number.MAX_SAFE_INTEGER, points = 0} = heroLevels[nextLevel] || {};

    this.setState({
      hero: {
        ...this.state.hero,
        stats: {
          ...this.state.hero.stats,
          level: nextLevel,
          nextExpLevel: requiredExp,
          statPoints: this.state.hero.stats.statPoints + points,
        },
        vitals: {
          ...this.state.hero.vitals,
          health: this.state.hero.stats.health,
          mana: this.state.hero.stats.mana,
          exp: leftoverExp,
        },
      },
    });
  }

  heroDie = (heroName = 'hero') => {
    this.setState({
      gameState: 'town',
      monster: null,
      [heroName]: {
        ...this.state[heroName],
        vitals: {
          ...this.state[heroName]['vitals'],
          health: this.state[heroName]['stats']['health'],
          mana: this.state[heroName]['stats']['mana'],
        },
        actionsDisabled: false,
      },
      inventory: [
        {
          ...this.state.inventory[0],
          quantity: 0,
        },
        ...this.state.inventory.slice(1),
      ],
    });
  }

  acknowledgeRewards = () => {
    const { rewards, index } = this.state.monster;
    const monstersAvailable = this.state.monstersInLevel;
    monstersAvailable[index] = null;
    const currentExp = this.state.hero.vitals.exp;
    const nextLevelExp = this.state.hero.stats.nextExpLevel;
    const levelUp = currentExp + rewards.exp >= nextLevelExp;

    const capacity = this.state.hero.equipment.backpack.attributes.capacity;
    const currentItems = this.state.inventory.length;
    const monsterItems = this.state.monster.rewards.items.length;
    const hasRoom = capacity >= currentItems + monsterItems;

    if (!hasRoom) {
      const take = currentItems + monsterItems - capacity;
      const start = take > 1 ? monsterItems - take : 0;
      rewards.items.splice(start, take);
    }

    // Add rewards + items to hero's inventory, remove defeated monster from level
    this.setState({
      monster: null,
      gameState: 'dungeon',
      monstersInLevel: monstersAvailable,
      hero: {
        ...this.state.hero,
        vitals: {
          ...this.state.hero.vitals,
          exp: this.state.hero.vitals.exp + rewards.exp
        },
        actionsDisabled: false,
      },
      inventory: [
        {
          ...this.state.inventory[0],
          quantity: this.state.inventory[0].quantity + rewards.gold,
        },
        ...this.state.inventory.slice(1),
        ...rewards.items
      ],
    });

    if (levelUp) {
      // Delay this slightly to let previous state update take effect
      setTimeout(() => this.levelUp(), 50);
    }
  }

  setActionsDisabled = (character, disabled) => {
    this.setState({
      hero: {
        ...this.state.hero,
        actionsDisabled: disabled,
      },
    });
  }

  changeStats = (changes) => {
    let newState = this.state;
    changes.forEach(({name, change}) => {
      const hero = 'hero';
      const healthChange = change * (statsMap[name] ? statsMap[name]['health'] || 0 : 0);
      const manaChange = change * (statsMap[name] ? statsMap[name]['mana'] || 0 : 0);
      // Account for attack and defence changes (equipment)
      let attackChange = 0
      if (name === 'attack') {
        attackChange = change;
      } else {
        attackChange = statsMap[name] ? statsMap[name]['attack'] || 0 : 0;
      }
      const defenceChange = name === 'defence' ? change : 0;

      newState = {
        ...newState,
        [hero]: {
          ...newState[hero],
          stats: {
            ...newState[hero]['stats'],
            [name]: newState[hero]['stats'][name] + change,
            health: newState[hero]['stats']['health'] + healthChange,
            mana: newState[hero]['stats']['mana'] + manaChange,
            attack: newState[hero]['stats']['attack'] + attackChange,
            defence: newState[hero]['stats']['defence'] + defenceChange,
          },
          vitals: {
            ...newState[hero]['vitals'],
            health: newState[hero]['vitals']['health'] + healthChange,
            mana: newState[hero]['vitals']['mana'] + manaChange,
          }
        },
      }
    });

    this.setState(newState);
  }

  applyEquipmentChange = (action, item) => {
    if (action === 'equip') {
      this.changeStats(
        Object.entries(item.attributes).map(([name, change]) => {
          return { name, change };
        })
      )
    } else {
      this.changeStats(
        Object.entries(item.attributes).map(([name, change]) => { 
          return {
            name,
            change: -change,
          };
        })
      );
    }
  }

  changeInventoryOrEquipment = (changeType, indexItemType, upgradeEquipped) => {
    const inventoryCapacity = this.state.hero.equipment.backpack.attributes.capacity;
    const currentItems = this.state.inventory.length;
    const hasRoomToUnequip = currentItems + 1 <= inventoryCapacity;
    let newInventory = this.state.inventory;
    let newEquipment = this.state.hero.equipment;
    let item = null;
    let sound = '';
    let cost = 0;

    switch(changeType) {
      case 'drop':
        item = newInventory[indexItemType];
        sound = item.assetInfo && item.assetInfo.moveSound;
        sound && this.props.playSoundEffect(sound);
        newInventory.splice(indexItemType, 1);
        break;
      case 'sell':
        item = this.state.inventory[indexItemType];
        newInventory.splice(indexItemType, 1);
        this.props.playSoundEffect('gold');
        newInventory[0].quantity += calculateSellingPrice(item);
        break;
      case 'buy':
        // Duplicate original
        newInventory.push(JSON.parse(JSON.stringify(indexItemType)));
        this.props.playSoundEffect('gold');
        newInventory[0].quantity -= indexItemType.price;
        break;
      case 'upgrade':
        cost = calculateUpgradePrice(indexItemType);
        // Remove stats from equipment so we can reapply them if item is equipped
        if (upgradeEquipped) {
          this.applyEquipmentChange('unequip', indexItemType);
        }
        applyItemUpgrade(indexItemType);
        if (upgradeEquipped) {
          setTimeout(() => this.applyEquipmentChange('equip', indexItemType), 0);
        }
        this.props.playSoundEffect('upgrade');
        newInventory[0].quantity -= cost;
        break;
      case 'use':
        item = this.state.inventory[indexItemType];
        sound = indexItemType.assetInfo && indexItemType.assetInfo.useSound;
        sound && this.props.playSoundEffect(sound);
        const {health, mana} = item.attributes.vitals;
        this.changeVitals('hero', {health, mana});
        newInventory.splice(indexItemType, 1);
        break;
      case 'equip':
        item = this.state.inventory[indexItemType];
        sound = item.assetInfo && item.assetInfo.moveSound;
        sound && this.props.playSoundEffect(sound);
        const type = item.type;
        const currentEquipment = newEquipment[type];
        if (type === 'weapon' && isTwoHanded(item)) {
          const currentShield = newEquipment.shield;
          if (currentShield) {
            if (!hasRoomToUnequip) { return; }
            setTimeout(() => this.applyEquipmentChange('unequip', currentShield), 0);
            newInventory.push(currentShield);
            newEquipment.shield = null;
          }
        } else if (type === 'shield') {
          const currentWeapon = newEquipment.weapon;
          if (currentWeapon && isTwoHanded(currentWeapon)) {
            if (!hasRoomToUnequip) { return; }
            setTimeout(() => this.applyEquipmentChange('unequip', currentWeapon), 0);
            newInventory.push(currentWeapon);
            newEquipment.weapon = null;
          }
        }
        // Remove current equipment
        if (currentEquipment) {
          setTimeout(() => this.applyEquipmentChange('unequip', currentEquipment), 0);
        }
        // Equip new item
        newEquipment[type] = item;
        if (currentEquipment) {
          newInventory.splice(indexItemType, 1, currentEquipment);
        } else {
          newInventory.splice(indexItemType, 1);
        }
        this.applyEquipmentChange('equip', item);
        break;
      case 'unequip':
        if (!hasRoomToUnequip) { return; }
        item = newEquipment[indexItemType];
        sound = item.assetInfo && item.assetInfo.moveSound;
        sound && this.props.playSoundEffect(sound);
        newEquipment[indexItemType] = null;
        newInventory.push(item);
        this.applyEquipmentChange('unequip', item);
        break;
      default:
        return;
    }
    setTimeout(() => this.setState({
      inventory: newInventory,
      equipment: newEquipment,
    }), 0);
  }

  learnOrUpgradeSkill = (skill) => {
    const newState = this.state;
    const skillType = skill.type;
    const currentSkillIndex = this.state.hero[skillType].findIndex((curSkill) => curSkill.id === skill.id);
    this.props.playSoundEffect('gold');

    const curretSkillLevel = currentSkillIndex > -1 ? this.state.hero[skillType][currentSkillIndex].level : 0;
    const price = skill.levels[curretSkillLevel + 1].price;
    if (currentSkillIndex > -1) {
      newState.hero[skillType][currentSkillIndex].level += 1;
    } else {
      newState.hero[skillType].push(skill);
    }
    newState.inventory[0].quantity -= price;
    this.setState(newState);
  }

  // Return an array of the right amount, and difficulty, of monsters for the current level
  getMonstersForCurrentLevel = (level) => {
    const { maxDifficulty, collections, count } = level.monsters;
    let monsters = allMonsters.filter((monster) => {
      return monster.difficulty <= maxDifficulty && collections.every((col) => monster.collections.includes(col));
    });
    
    // Lets not do an infinite loop if no monsters found, just an error
    if (monsters.length === 0) {
      console.error('No monsters were found that match level specs');
      return null;
    }

    // Duplciate the monsters available until we have enough monsters for the level
    while (monsters.length < count) {
      const spliceCount = count - monsters.length;
      monsters = monsters.concat(monsters.slice(0, spliceCount));
    }

    monsters = monsters.length > count 
      ? monsters.slice(0, count - monsters.length)
      : monsters;

    return this.populateMonsterData(monsters, level);
  }

  // Generates a monster object based on a given monster
  populateMonsterData = (monsters, levelData) => {
    // Add anywhere already used so we don't place a monster there
    let usedLocations = [];
    levelData.connections.forEach((con) => usedLocations.push({x: con.location.x, y: con.location.y}));
    usedLocations.push(levelData.start);

    return monsters.map((monsterSchema, index) => {
      const heroLevel = this.state.hero.stats.level;
      const [monsterMinLevel, monsterMaxLevel] = monsterSchema.stats.level;
      let minLevel = heroLevel <= monsterMinLevel ? monsterMinLevel : heroLevel - 1;
      let maxLevel = heroLevel > monsterMaxLevel ? monsterMaxLevel : heroLevel;
      if (minLevel > monsterMaxLevel) {
        minLevel = monsterMaxLevel;
        maxLevel = minLevel;
      } else if (minLevel > maxLevel) {
        maxLevel = minLevel;
      }
      const stats = {
        level: generateStat([minLevel, maxLevel]),
      };
      const levelMultiplier = (() => {
        if (stats.level >= 3) {
          return stats.level / 2;
        } else if (stats.level === 2) {
          return 1.25;
        } else {
          return 1;
        }
      })();
      const rewards = { items: [] };
      let minPoints = 0;
      let maxPoints = 0;
      let currentPoints = 0;
      const skipStats = ['attack', 'defence', 'level']
      Object.entries(monsterSchema.stats).forEach(([stat, minMax]) => {
        if (skipStats.includes(stat)) { return; }
        const statValue = generateStat(minMax);
        minPoints += minMax[0];
        maxPoints += minMax[1] || minMax[0];
        currentPoints += statValue;
        stats[stat] = Math.floor(statValue * levelMultiplier);
      });
      const {health, mana} = calculateVitals(stats);
      const baseAttack = monsterSchema.stats.attack ? generateStat(monsterSchema.stats.attack) : 0;
      const attack = calculateAttack(stats) + baseAttack;
      const defence = monsterSchema.stats.defence ? generateStat(monsterSchema.stats.defence) : 0;
      Object.entries(monsterSchema.rewards).forEach(([rewardName, reward]) => {
        if (rewardName !== 'items') {
          const percentage = Math.ceil(((currentPoints - minPoints) / (maxPoints - minPoints) * 100)) || 0;
          rewards[rewardName] = Math.floor(calculatePercentagePoint(reward, percentage) * levelMultiplier);
        } else {
          Object.entries(monsterSchema.rewards.items).forEach(([nameOrId, percentRange]) => {
            // Use min/max generator function to pick a chance between the two numbers
            const itemChance = generateStat(percentRange);
            const gotItem = checkIfSuccessful(itemChance < 100 ? itemChance : 100);
            if (!gotItem) { return; }
            const item = getItem(nameOrId);
            populateItemStats(item);
            rewards.items.push(item);
          });
        }
      });

      // Place the monsters somewhere in the dungeon
      let location = null;
      while (!location) {
        let randomX = Math.floor(Math.random() * levelData.map[0].length);
        let randomY = Math.floor(Math.random() * levelData.map.length);

        let used = usedLocations.find((loc) => loc.x === randomX && loc.y === randomY);
        let tile = levelData.map[randomY][randomX];
        if (levelData.assetInfo[tile].walk && !used) {
          location = {
            x: randomX,
            y: randomY,
          };
          usedLocations.push(location);
        }
      }

      return {
        ...monsterSchema,
        index,
        location,
        stats: {
          ...stats,
          health,
          mana,
          attack,
          defence,
        },
        vitals: {
          health,
          mana,
        },
        rewards,
      };
    });
  }

  endCombat = () => {
    this.setState({gameState: 'dungeon', noCombat: true});
  }

  goToTown = () => {
    this.setState({gameState: 'town'});
  }

  // TODO: This should get random treasures for the current level
  getTreasuresForCurrentLevel = () => {

  }

  // Start a fight with the monster that was touched
  startFight = (monsterIndex) => {
    const monster = this.state.monstersInLevel[monsterIndex];

    this.setState({
      gameState: 'combat',
      monster,
      hero: {
        ...this.state.hero,
        actionsDisabled: true,
      },
    });
  }

  showMenu = () => {
    this.props.showMenu(this.state);
  }

  updateLastStageSizes = ({tileSize, stageWidth}) => {
    this.setState({
      lastTileSize: tileSize,
      lastStageWidth: stageWidth, 
    });
  }

  render() {
    const { hero } = this.state;

    return (
      <main className="Main">
        <FlexRow>
          <Display
            game={this.state}
            transitionToLevel={this.transitionToLevel}
            changeVitals={this.changeVitals}
            changeStats={this.changeStats}
            heroDie={this.heroDie}
            goToTown={this.goToTown}
            startFight={this.startFight}
            acknowledgeRewards={this.acknowledgeRewards}
            setActionsDisabled={this.setActionsDisabled}
            setAvailableActions={this.setAvailableActions}
            characterCreationCompleted={this.characterCreationCompleted}
            playSoundEffect={this.props.playSoundEffect}
            endCombat={this.endCombat}
            showMenu={this.showMenu}
            setBgMusic={this.props.setBgMusic}
            gameSlots={this.props.gameSlots}
            changeInventoryOrEquipment={this.changeInventoryOrEquipment}
            learnOrUpgradeSkill={this.learnOrUpgradeSkill}
            moveTo={this.moveTo}
            updateLastStageSizes={this.updateLastStageSizes}
          />
          <Stats
            heroName={hero.name}
            allStats={hero.stats}
            changeStats={this.changeStats}
            disableChange={this.state.gameState === 'combat'}
            tempStats={getEquipmentSummary(hero)}
          />
        </FlexRow>
        <FlexRow>
          <ActionList
            availableActions={this.state.availableActions || []}
            disabled={this.state.hero.actionsDisabled}
            gold={this.state.inventory[0].quantity}
          />
          <Vitals hero={this.state.hero}/>
        </FlexRow>
      </main>
    );
  }
}
