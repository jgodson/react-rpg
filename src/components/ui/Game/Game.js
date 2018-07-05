import React from 'react';
import {
  FlexRow,
  Display,
  Stats,
  ActionList,
  Vitals,
  Bar,
  Modal,
} from '../../ui'
import heroLevels from '../../../assets/data/heroLevels';
import statsMap from '../../../assets/data/statsMap';
import levelData from '../../../assets/data/levels';
import barColors from '../../../helpers/barColors';
import allMonsters from '../../../assets/data/monsters';
import allItems from '../../../assets/data/items';
import { checkIfSuccessful } from '../../../helpers/battleHelpers';
import './Game.css';

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    const { gameData } = props;

    // Game constants
    // Damage is multiplied by this amount when a critical hit occurs
    this.CRITICAL_HIT_MULTIPLIER = 3;
    // Chance of inflicting a critical hit
    this.CRITICAL_HIT_CHANCE = 2;
    // High agility and dexterity get you a better chance of critical hit
    this.CRITICAL_HIT_CHANCE_IMPROVED = 3;

    if (gameData.hero.new) {
      const { health, mana } = this.calculateVitals(gameData.hero.stats);
      const attack = this.calculateAttack(gameData.hero.stats);
      this.state = {
        ...gameData,
        heroDidAttack: [],
        level: {},
        monstersInLevel: [],
        treasuresInLevel: [],
        hero: {
          ...gameData.hero,
          new: false,
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
          skills: [],
          magic: [],
          assetInfo: {
            image: 'knight',
            attackSound: 'swordAttack',
            deathSound: '',
          },
        },
        townAction: null,
      };
    } else {
      this.state = gameData;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.gameState !== prevState.gameState) {
      this.props.changeLocation(this.state.gameState);
    }
  }

  transitionToLevel = (nameOrId) => {
    let level = null;
    if (typeof nameOrId === 'number') {
      level = levelData.find((level) => level.id === nameOrId);
    } else {
      level = levelData.find((level) => level.name === nameOrId);
    }
    const monstersInLevel = this.getMonstersForCurrentLevel(level);
    
    this.setState({
      level,
      monstersInLevel,
      gameState: level ? level.type : this.state.gameState,
    });
  }

  getVitals = (character) => this.state[character]['vitals'];

  getStats = (character) => this.state[character]['stats'];

  calculateAttack = (stats) => {
    let attack = null;

    Object.entries(stats).forEach(([name, value]) => {
      if (statsMap[name]) {
        attack += (statsMap[name]['attack'] || 0) * value;
      }
    });

    return attack;
  }

  calculateVitals = (stats) => {
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

  changeVitals = (character, {health = 0, mana = 0, exp = 0}) => {
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
    });

    if (character.indexOf('hero') > -1 && levelUp) {
      this.levelUp(character);
    }
  }

  levelUp = (character = 'hero') => {
    const leftoverExp = this.state.hero.stats.nextExpLevel - this.state.hero.vitals.exp;
    const nextLevel = this.state.hero.stats.level + 1;
    let {requiredExp = Number.MAX_SAFE_INTEGER, points = 0} = heroLevels[nextLevel] || {};

    this.setState({
      [character]: {
        ...this.state[character],
        stats: {
          ...this.state[character]['stats'],
          level: nextLevel,
          nextExpLevel: requiredExp,
          statPoints: this.state[character]['stats']['statPoints'] + points,
        },
        vitals: {
          ...this.state[character]['vitals'],
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
    const { rewards } = this.state.monster;
    const currentExp = this.state.hero.vitals.exp;
    const nextLevelExp = this.state.hero.stats.nextExpLevel;
    const levelUp = currentExp + rewards.exp >= nextLevelExp;

    // Add items that were wanted to hero's inventory
    this.setState({
      monster: null,
      gameState: 'dungeon',
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

  setActionsAvailable = (character, available) => {
    this.setState({
      [character]: {
        ...this.state[character],
        actionsDisabled: !available,
      },
    });
  }

  changeStats = (changes) => {
    let newState = this.state;
    changes.forEach(({name, change}) => {
      const hero = 'hero';
      const healthChange = statsMap[name] ? statsMap[name]['health'] || 0 : 0;
      const manaChange = statsMap[name] ? statsMap[name]['mana'] || 0 : 0;
      const attackChange = statsMap[name] ? statsMap[name]['attack'] || 0 : 0;

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

  // Return an array of the right amount, and difficulty, of monsters for the current level
  getMonstersForCurrentLevel = (level) => {
    const { maxDifficulty, collections, count } = level.monsters;
    let monsters = allMonsters.filter((monster) => {
      return monster.difficulty <= maxDifficulty && collections.every((col) => monster.collections.includes(col));
    });

    // Duplciate the monsters available until we have enough monsters for the level
    while (monsters.length < count) {
      const spliceCount = count - monsters.length;
      monsters = monsters.concat(monsters.slice(0, spliceCount));
    }

    monsters = monsters.length > count 
      ? monsters.slice(0, count - monsters.length)
      : monsters;

    return this.populateMonsterData(monsters);
  }

  // Generates a monster object based on a given monster
  populateMonsterData = (monsters) => {
    return monsters.map((monsterSchema) => {
      const minLevel = monsterSchema.stats.level[0];
      let maxLevel = Math.min(monsterSchema.stats.level[1], this.state.hero.stats.level);
      if (maxLevel < minLevel) {
        maxLevel = minLevel;
      }
      const stats = {
        level: generateStat([minLevel, maxLevel]),
      };
      const levelMultiplier = (() => {
        if (stats.level > 3) {
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
      const {health, mana} = this.calculateVitals(stats);
      const baseAttack = monsterSchema.stats.attack ? generateStat(monsterSchema.stats.attack) : 0;
      const attack = this.calculateAttack(stats) + baseAttack;
      const defence = monsterSchema.stats.defence ? generateStat(monsterSchema.stats.defence) : 0;
      Object.entries(monsterSchema.rewards).forEach(([rewardName, reward]) => {
        if (rewardName !== 'items') {
          const percentage = Math.ceil(((currentPoints - minPoints) / (maxPoints - minPoints) * 100)) || 0;
          rewards[rewardName] = Math.floor(this.calculatePercentagePoint(reward, percentage) * levelMultiplier);
        } else {
          Object.entries(monsterSchema.rewards.items).forEach(([nameOrId, percentRange]) => {
            // Use min/max generator function to pick a chance between the two numbers
            const itemChance = generateStat(percentRange);
            const gotItem = checkIfSuccessful(itemChance < 100 ? itemChance : 100);
            if (!gotItem) { return; }
            const item = this.getItem(nameOrId);
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
              item.price = this.calculatePercentagePoint(item.price, percentage);
            } else {
              item.price = generateStat(item.price);
            }
            rewards.items.push(item);
          });
        }
      });

      return {
        ...monsterSchema,
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

    function generateStat([min, max]) {
      if (!max) { return min; }
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }

  // TODO: This should get random treasures for the current level
  getTreasuresForCurrentLevel = () => {

  }
  
  // TODO: This should generate the level based on the level data
  generateCurrentLevel = () => {

  }

  heroAttack = (name = 'hero', target = 'monster') => {
    const attacker = this.state[name];
    const defender = this.state[target];
    const criticalMult = this.checkCritical(attacker, defender) ? this.CRITICAL_HIT_MULTIPLIER : 1;
    const damage = this.calculateDamage(attacker.stats.attack, defender.stats.defence, criticalMult);
    const attackSound = this.state[name]['assetInfo']['attackSound'];
    this.props.playSoundEffect(attackSound);

    this.setState({
      heroDidAttack: [...this.state.heroDidAttack, name],
      [target]: {
        ...this.state[target],
        vitals: {
          ...this.state[target]['vitals'],
          health: this.state[target]['vitals']['health'] - damage,
        },
      },
      [name]: {
        ...this.state[name],
        actionsDisabled: true,
      },
    });
  }

  heroWasReset = (names) => {
    const newState = this.state;
    names.forEach((name) => {
      const index = newState.heroDidAttack.indexOf(name);
      newState.heroDidAttack.splice(index, 1);
    });
    this.setState(newState);
  }

  calculatePercentagePoint = ([min, max], percentage) => {
    if (!max) { return min; }
    return Math.floor((max - min) * (percentage) * 0.01 + min);
  }

  checkCritical = (attacker, defender) => {
    const attackerPoints = attacker.stats.dexterity + attacker.stats.agility;
    const defenderPoints = defender.stats.dexterity + defender.stats.agility;
    const randomizer = Math.random() * 100;
    if (attackerPoints > defenderPoints) {
      return randomizer > (100 - this.CRITICAL_HIT_CHANCE_IMPROVED);
    }
    return randomizer > (100 - this.CRITICAL_HIT_CHANCE);
  }

  calculateDamage = (baseAttack, baseDefence = 0, multiplier = 1) => {
    const randomizer = Math.max(Math.random() * 100, 80) / 100;
    const randomizer2 = Math.max(Math.random() * 100, 70) / 100;
    let damage = Math.floor((baseAttack * randomizer * multiplier) - (baseDefence * randomizer2));
    if (baseDefence !== 0 && damage < 0) {
      damage = 0;
    }
    return damage;
  }

  // Start a fight with the monster that was touche
  startFight = (monster) => {
    // TODO: Remove when can start fights by touching enemies
    const monstersAvailable = this.state.monstersInLevel;
    if (!monster) {
      monster = this.state.monstersInLevel.pop();
    }

    this.setState({
      gameState: 'combat',
      monster,
      hero: {
        ...this.state.hero,
        actionsDisabled: true,
      },
      monstersInLevel: monstersAvailable,
    });
  }

  // Returns an item with give id or name
  getItem(nameOrId) {
    let item = null;
    const id = parseInt(nameOrId, 10);
    if (isNaN(id)) {
      item = allItems.find((item) => item.name === nameOrId);
    } else {
      item = allItems.find((item) => item.id === id);
    }
    // Duplicate object so we avoid any funkiness
    return JSON.parse(JSON.stringify(item));
  }

  restAtInn = (cost) => {
    const maxHealth = this.state.hero.stats.health;
    const maxMana = this.state.hero.stats.mana;

    this.setState({
      hero: {
        ...this.state.hero,
        vitals: {
          ...this.state.hero.vitals,
          health: maxHealth,
          mana: maxMana,
        }
      },
      inventory: [
        {
          quantity: this.state.inventory[0].quantity - cost,
        },
        ...this.state.inventory.slice(1),
      ],
      townAction: null,
    });
  }

  render() {
    const {
      hero,
      location,
      gameState,
    } = this.state;

    const {
      showMenu,
      saveGame,
      playSoundEffect,
      setBgMusic,
    } = this.props;

    /* Available Actions */
    const actions = {
      combat: [
        {name: 'Attack', destructive: true, onClick: () => this.heroAttack() },
        {name: 'Magic', destructive: true, disabled: true},
        {name: 'Item', secondary: true, disabled: true},
        {name: 'Run', secondary: true, onClick: () => this.setState({gameState: 'dungeon', monster: null}) },
      ],
      dungeon: [
        {name: 'Inventory', disabled: true},
        {name: 'Enter combat', destructive: true, onClick: () => this.startFight() },
        {name: 'Go to town', secondary: true, onClick: () => this.setState({gameState: 'town'}) },
      ],
      town: [
        {name: 'Inn', onClick: () => this.setState({gameState: 'inn'}) },
        {name: 'Blacksmith', onClick: () => this.setState({gameState: 'blacksmith'}) },
        {name: 'Training Grounds', onClick: () => this.setState({gameState: 'training'}) },
        {name: 'General Store', onClick: () => this.setState({gameState: 'generalStore'}) },
        {name: 'Save Game', secondary: true, onClick: () => saveGame('savegame', this.state)},
        {name: 'Main Menu', destructive: true, onClick: () => showMenu(this.state) },
        {name: 'Go to dungeon', secondary: true, onClick: () => this.transitionToLevel("Cave Level 1")},
      ],
      blacksmith: [
        {name: 'Buy', disabled: true},
        {name: 'Sell', disabled: true},
        {name: 'Enhance', disabled: true},
        {name: 'Back to town', secondary: true, onClick: () => this.setState({gameState: 'town'}) },
      ],
      training: [
        {name: 'Train Skills', disabled: true},
        {name: 'Train Magic', disabled: true},
        {name: 'Back to town', secondary: true, onClick: () => this.setState({gameState: 'town'}) },
      ],
      generalStore: [
        {name: 'Buy', disabled: true},
        {name: 'Sell', disabled: true},
        {name: 'Back to town', secondary: true, onClick: () => this.setState({gameState: 'town'}) },
      ],
      inn: [
        {name: 'Rest', onClick: () => this.setState({townAction: 'inn'})},
        {name: 'Quests', disabled: true},
        {name: 'Back to town', secondary: true, onClick: () => this.setState({gameState: 'town'}) },
      ],
    }

    const availableActions = actions[gameState];

    let modalActions = null;
    const modalContent = (() => {
      switch (this.state.townAction) {
        case 'inn': 
          const cost = this.state.hero.stats.level * 15;
          const playerCanRest = this.state.inventory[0].quantity >= cost;
          modalActions = [
            { 
              name: 'Yes',
              primary: true,
              disabled: !playerCanRest,
              tooltip: !playerCanRest && 'Not enough gold',
              onClick: () => this.restAtInn(cost),
            },
            { name: 'No', destructive: true, onClick: () => this.setState({townAction: null}) },
          ];
          return <p>Would you like to rest for {cost} gold</p>;
        default:
          return;
      }
    })();

    return (
      <main className="Main">
        <FlexRow>
          <Display 
            game={this.state}
            transitionToLevel={this.transitionToLevel}
            changeVitals={this.changeVitals}
            heroDie={this.heroDie}
            acknowledgeRewards={this.acknowledgeRewards}
            setActionsAvailable={this.setActionsAvailable}
            heroWasReset={this.heroWasReset}
            checkCritical={this.checkCritical}
            calculateDamage={this.calculateDamage}
            playSoundEffect={playSoundEffect}
            setBgMusic={setBgMusic}
          />
          <Stats 
            allStats={hero.stats}
            changeStats={this.changeStats}
            disableChange={this.state.gameState === 'combat'}
          />
        </FlexRow>
        <FlexRow>
          <ActionList 
            availableActions={availableActions}
            disabled={this.state.hero.actionsDisabled}
            gold={this.state.inventory[0].quantity}
          />
          <Vitals>
            <Bar
              label="Health"
              current={hero.vitals.health}
              max={hero.stats.health}
              showStatus
              lowColor={barColors.health.low}
              highColor={barColors.health.high}
            />
            <Bar
              label="Mana"
              current={hero.vitals.mana}
              max={hero.stats.mana}
              showStatus
              lowColor={barColors.mana.low}
              highColor={barColors.mana.high} 
            />
            <Bar
              label="Experience"
              current={hero.vitals.exp}
              max={hero.stats.nextExpLevel}
              showStatus
              highColor={barColors.exp.color}
            />
          </Vitals>
        </FlexRow>
        <Modal
          shown={this.state.townAction != null}
          onClose={() => this.setState({townAction: null})}
          actions={modalActions}
          backgroundClickCloses
        >
          {modalContent}
        </Modal>
      </main>
    );
  }
}