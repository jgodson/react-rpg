import React from 'react';
import {
  FlexRow,
  Display,
  Stats,
  ActionList,
  Vitals,
  Bar,
} from '../../ui'
import heroLevels from '../../../assets/data/heroLevels';
import statsMap from '../../../assets/data/statsMap';
import levelData from '../../../assets/data/levels';
import barColors from '../../../helpers/barColors';
import allMonsters from '../../../assets/data/monsters';
import allItems from '../../../assets/data/items';
import './Game.css';

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    const { gameData } = props;

    if (gameData.hero.new) {
      const { health, mana } = this.calculateVitals(gameData.hero.stats);
      const attack = this.calculateAttack(gameData.hero.stats);
      this.state = {
        ...gameData,
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
          },
        },
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
    const newHealth = this.state[character]['vitals']['health'] + health;
    const newMana = this.state[character]['vitals']['mana'] + mana;
    const isDead = newHealth <= 0;

    this.setState({
      ...this.state,
      [character]: {
        ...this.state[character],
        vitals: {
          health: isDead ? 0 : newHealth,
          mana: newMana > 0 ? newMana : 0,
          exp: this.state[character]['vitals']['exp'] + exp,
        },
      },
    });

    if (character.indexOf('hero') > -1) {
      if (levelUp) {
        this.levelUp(character);
      } else if (isDead) {
        this.heroDie(character);
      }
    } else if (character.indexOf('monster') > -1) {
      if (isDead) {
        this.monsterDie(character);
      }
    }
  }

  levelUp = (character) => {
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

  heroDie = () => {

  }

  monsterDie = (monster = 'monster') => {
    const rewards = this.state[monster]['rewards'];


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
      const stats = {};
      const rewards = {};
      Object.entries(monsterSchema.stats).map(([stat, minMax]) => {
        stats[stat] = generateStat(minMax);
      });
      const {health, mana} = this.calculateVitals(stats);
      const attack = this.calculateAttack(stats);
      Object.entries(monsterSchema.rewards).map(([rewardName, reward]) => {
        if (reward === 'items') {
          rewards[rewardName] = reward;
        }
        const [min, max] = reward;
        rewards[rewardName] = generateStat(reward);
      });

      return {
        ...monsterSchema,
        stats: {
          ...stats,
          health,
          mana,
          attack,
        },
        vitals: {
          health,
          mana,
        },
        rewards: {
          ...rewards,
        }
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

  render() {
    const {
      hero,
      monster,
      location,
      gameState,
    } = this.state;

    const {
      showMenu,
      saveGame,
    } = this.props;

    /* Available Actions */
    const actions = {
      combat: [
        {name: 'Attack', destructive: true},
        {name: 'Magic', destructive: true, disabled: true},
        {name: 'Item', secondary: true, disabled: true},
        {name: 'Run', secondary: true, onClick: () => this.setState({gameState: 'dungeon'}) },
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
        {name: 'Rest', disabled: true},
        {name: 'Quests', disabled: true},
        {name: 'Back to town', secondary: true, onClick: () => this.setState({gameState: 'town'}) },
      ],
    }

    const availableActions = actions[gameState];

    return (
      <main className="Main">
        <FlexRow>
          <Display 
            game={this.state}
            transitionToLevel={this.transitionToLevel}
            changeStats={this.changeStats}
            monsterDie={this.monsterDie}
            heroDie={this.heroDie}
            setActionsAvailable={this.setActionsAvailable}
          />
          <Stats allStats={hero.stats} changeStats={this.changeStats} />
        </FlexRow>
        <FlexRow>
          <ActionList availableActions={availableActions} disabled={this.state.hero.actionsDisabled} />
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
      </main>
    );
  }
}