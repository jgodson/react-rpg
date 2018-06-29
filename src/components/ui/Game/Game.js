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

  heroAttack = (name = 'hero') => {

  }

  monsterAttack = (name = 'monster') => {

  }

  checkIfSuccessful = (percentChance) => Math.random() * 100 < percentChance

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

  calculateDamage = (baseAttack, baseDefence = 0, multiplier = 1) => {
    const randomizer = Math.max(Math.random() * 100, 80) / 100;
    const randomizer2 = Math.max(Math.random() * 100, 70) / 100;
    return Math.floor((baseAttack * randomizer * multiplier) - (baseDefence * randomizer2));
  }

  getMonster = () => {

  }

  render() {
    /* Colors for health and mana bars */
    const barColors = {
      health: {
        low: '#f47142',
        high: '#7af441'
      },
      mana: {
        low: '#f47142',
        high: '#41acf4'
      },
      exp: {
        color: '#ede436',
      }
    }

    const {
      hero,
      monster,
      location,
      gameState,
    } = this.state;

    const {
      showMenu,
      saveGame,
      playSoundEffect,
    } = this.props;

    /* Available Actions */
    const actions = {
      combat: [
        {name: 'Attack', destructive: true},
        {name: 'Magic', destructive: true, disabled: true},
        {name: 'Item', secondary: true, disabled: true},
        {name: 'Take Damage' , onClick: () => {
          const criticalMult = Math.random() > 0.05 ? 1 : 5;
          const damage = -(this.calculateDamage(25, 1, criticalMult));
          this.changeVitals('hero', {health: damage});
        }},
        {name: 'Gain Experience' , onClick: () => {
          const experience = Math.floor(Math.random() * 50);
          this.changeVitals('hero', {exp: experience});
        }},
        {name: 'Use Mana' , onClick: () => {
          const amount = -(Math.floor(Math.random() * 10));
          this.changeVitals('hero', {mana: amount});
        }},
        {name: 'Run', secondary: true, onClick: () => { this.setState({gameState: 'dungeon'}) }},
      ],
      dungeon: [
        {name: 'Inventory', disabled: true},
        {name: 'Enter combat', destructive: true, onClick: () => { this.setState({gameState: 'combat'}) }},
        {name: 'Go to town', secondary: true, onClick: () => { this.setState({gameState: 'town'}) }},
      ],
      town: [
        {name: 'Inn', onClick: () => { this.setState({gameState: 'inn'}) }},
        {name: 'Blacksmith', onClick: () => { this.setState({gameState: 'blacksmith'}) }},
        {name: 'Training Grounds', onClick: () => { this.setState({gameState: 'training'}) }},
        {name: 'General Store', onClick: () => { this.setState({gameState: 'generalStore'}) }},
        {name: 'Save Game', secondary: true, onClick: () => saveGame('savegame', this.state)},
        {name: 'Main Menu', destructive: true, onClick: () => showMenu(this.state) },
        {name: 'Go to dungeon', secondary: true, onClick: () => { this.setState({gameState: 'dungeon'}) }},
      ],
      blacksmith: [
        {name: 'Buy', disabled: true},
        {name: 'Sell', disabled: true},
        {name: 'Enhance', disabled: true},
        {name: 'Back to town', secondary: true, onClick: () => { this.setState({gameState: 'town'}) }},
      ],
      training: [
        {name: 'Train Skills', disabled: true},
        {name: 'Train Magic', disabled: true},
        {name: 'Back to town', secondary: true, onClick: () => { this.setState({gameState: 'town'}) }},
      ],
      generalStore: [
        {name: 'Buy', disabled: true},
        {name: 'Sell', disabled: true},
        {name: 'Back to town', secondary: true, onClick: () => { this.setState({gameState: 'town'}) }},
      ],
      inn: [
        {name: 'Rest', disabled: true},
        {name: 'Quests', disabled: true},
        {name: 'Back to town', secondary: true, onClick: () => { this.setState({gameState: 'town'}) }},
      ],
    }

    const availableActions = actions[gameState];

    return (
      <main className="Main">
        <FlexRow>
          <Display gameState={this.state} />
          <Stats allStats={hero.stats} changeStats={this.changeStats} />
        </FlexRow>
        <FlexRow>
          <ActionList availableActions={availableActions}/>
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