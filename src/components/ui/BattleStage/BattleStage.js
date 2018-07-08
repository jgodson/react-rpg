import React from 'react';
import PropTypes from 'prop-types';
import { Character, ItemCard, Button } from '../../ui';
import battleStages from '../../../assets/battle-backgrounds';
import heroImages from '../../../assets/heros';
import monsterImages from '../../../assets/monsters';
import {
  checkIfSuccessful,
  MINIMUM_DAMAGE_PERCENTAGE,
  MINIMUM_DEFENCE_PERCENTAGE
} from '../../../helpers/battleHelpers';
import './BattleStage.css';

export default class BattleStage extends React.Component {
  constructor(props) {
    super(props);
    const { game } = props;
    const { hero, monster } = game;

    // Set a timer to keep the battle moving
    this.battleTimer = setInterval(this.passTime, 200);
    this.attackTimers = {};
    this.messageTimer = null;

    // Delay monster attacks once action bar is full to make it more fair
    this.MONSTER_ATTACK_DELAY = 1000;

    // Minimum and improved chance of running from battle 
    this.RETREAT_CHANCE = 80;
    this.RETREAT_CHANCE_IMPROVED = 90;

    // Damage is multiplied by this amount when a critical hit occurs
    this.CRITICAL_HIT_MULTIPLIER = 3;
    // Chance of inflicting a critical hit
    this.CRITICAL_HIT_CHANCE = 2;
    // High agility and dexterity get you a better chance of critical hit
    this.CRITICAL_HIT_CHANCE_IMPROVED = 3;

    this.state = {
      showRewards: false,
      showDefault: false,
      actionBoost: {
        hero: this.calculateActionBarTime(hero.stats.agility),
        monster: this.calculateActionBarTime(monster.stats.agility),
      },
      actionCharging: {
        hero: true,
        monster: true,
      },
      actionTime: {
        hero: this.calculateActionBarStart(hero.stats.agility),
        monster: this.calculateActionBarStart(monster.stats.agility),
      },
      combatMessage: null,
    };

    const combatActions = [
      { name: 'Attack', destructive: true, onClick: this.heroAttack },
      { name: 'Magic', destructive: true, disabled: true },
      { name: 'Item', secondary: true, disabled: true },
      { name: 'Run', secondary: true, onClick: this.retreat },
    ];

    this.props.setAvailableActions(combatActions);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.game.heroDidAttack.length > 0) {
      const newState = this.state;
      newProps.game.heroDidAttack.forEach((hero) => {
        newState.actionTime[hero] = 0;
      });
      this.setState(newState);
      this.props.heroWasReset(newProps.game.heroDidAttack);
    }
  }

  componentDidUpdate() {
    const { game } = this.props;
    const { monster, hero } = game;
    // Check if monster or hero is dead
    if (monster.vitals.health <= 0 && !this.state.showRewards) {
      this.props.playSoundEffect(monster.assetInfo.deathSound);
      this.props.setBgMusic('combatVictory', 1500);
      this.setState({showRewards: true});
      this.clearTimers();
    } else if (hero.vitals.health <= 0 && !this.state.showDefeat) {
      this.props.playSoundEffect(hero.assetInfo.deathSound);
      this.props.setBgMusic('combatDefeat', 1500);
      this.setState({showDefeat: true});
      this.clearTimers();
    }
  }

  componentWillUnmount() {
    // Clean up the battle timers (hero die will make this happen right now)
    this.clearTimers();
  }

  retreat = () => {
    const monsterPoints = this.props.game.monster.agility + this.props.game.monster.dexterity;
    const heroPoints = this.props.game.monster.agility + this.props.game.monster.dexterity;
    let chance = 0;
    if (heroPoints > monsterPoints) {
      chance = this.RETREAT_CHANCE_IMPROVED;
    } else {
      chance = this.RETREAT_CHANCE;
    }

    if (checkIfSuccessful(chance)) {
      this.props.endCombat()
    } else {
      this.props.setActionsDisabled('hero', true);
      this.messageTimer = setTimeout(() => this.setState({combatMessage: null}), 2000);
      this.setState({
        combatMessage: 'Failed to retreat from combat',
        actionTime: {
          ...this.state.actionTime,
          hero: 0,
        }
      });
    }
  }

  clearTimers = () => {
    clearInterval(this.battleTimer);
    Object.entries(this.attackTimers).forEach(([_, timer]) => {
      clearTimeout(timer);
    });
    clearTimeout(this.messageTimer);
  }

  monsterAttack = (name = 'monster', target = 'hero') => {
    const { game } = this.props;
    const attacker = game[name];
    const defender = game[target];
    // TODO: Allow monster to use skills if they have them (some sort of AI going on here)
    const criticalMult = this.checkCritical(attacker, defender) ? 5 : 1;
    const damage = this.calculateDamage(attacker.stats.attack, defender.stats.defence, criticalMult);
    this.props.playSoundEffect(attacker.assetInfo.attackSound);
    this.props.changeVitals(target, {health: -damage});

    this.setState({
      actionTime: {
        ...this.state.actionTime,
        [name]: 0,
      },
      actionCharging: {
        ...this.state.actionCharging,
        [name]: true,
      },
    });
  }

  heroAttack = () => {
    const { game } = this.props;
    const attacker = game.hero;
    const defender = game.monster;

    const criticalMult = this.checkCritical(attacker, defender) ? this.CRITICAL_HIT_MULTIPLIER : 1;
    const damage = this.calculateDamage(attacker.stats.attack, defender.stats.defence, criticalMult);
    const attackSound = game.hero.assetInfo.attackSound;
    this.props.playSoundEffect(attackSound);

    this.props.setActionsDisabled('hero', true);
    this.props.changeVitals('monster', {health: -damage});
    this.setState({
      actionTime: {
        ...this.state.actionTime,
        hero: 0,
      }
    });
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

  calculateActionBarTime = (agility) => {
    const time = agility / 5;
    return time < 2 ? 2 : time;
  }

  calculateActionBarStart = (agility) => {
    let picks = Math.floor(agility / 5);
    picks = picks > 1 ? picks : 1;
    const randomNumbers = Array.from({length: picks}, () => Math.random() * 100);
    return Math.floor(Math.max(...randomNumbers));
  }

  calculateDamage = (baseAttack, baseDefence = 0, multiplier = 1) => {
    const randomizer = Math.max(Math.random() * 100, MINIMUM_DAMAGE_PERCENTAGE) / 100;
    const randomizer2 = Math.max(Math.random() * 100, MINIMUM_DEFENCE_PERCENTAGE) / 100;
    let damage = Math.floor((baseAttack * randomizer * multiplier) - (baseDefence * randomizer2));
    if (baseDefence !== 0 && damage < 0) {
      damage = 0;
    }
    return damage;
  }

  passTime = () => {
    const boosts = this.state.actionBoost;
    const times = this.state.actionTime;
    const canAttack = [];
    Object.entries(times).forEach((([name, current]) => {
      if (this.state.actionCharging[name]) {
        const newTime = current + boosts[name];
        times[name] = newTime > 100 ? 100 : newTime;
        if (newTime >= 100) {
          if (name.indexOf('hero') > -1) {
            this.props.setActionsDisabled(name, false);
          } else {
            canAttack.push(name);
          }
        }
      }
    }));

    this.setState({
      actionTime: times,
    });

    canAttack.forEach((monster) => {
      this.attackTimers[monster] = setTimeout(() => this.monsterAttack(monster, 'hero'), this.MONSTER_ATTACK_DELAY);
      this.setState({
        actionCharging: {
          ...this.state.actionCharging,
          [monster]: false,
        },
      });
    });
  }

  render() {
    const { game } = this.props;
    const {
      hero,
      monster,
      level,
      inventory,
    } = game;
    const backgroundName = `${level.assetInfo.battleBg}Battle`;

    return (
      <div className="BattleStage" style={{ backgroundImage: `url("${battleStages[backgroundName]}")`}}>
        <div className={`modal ${this.state.showRewards ? 'shown': ''}`}>
          <h3>You defeated the monster!</h3>
          <p>Gained {monster.rewards.exp} experience!</p>
          <p>The monster dropped some items!</p>
          <div className="items">
              <ItemCard
                image="coin"
                quantity={monster.rewards.gold}
                name="Gold"
              />
            {monster.rewards.items.map((item) => {
              return (
                <ItemCard
                  image={item.image}
                  quantity={1}
                  stats={item.attributes}
                  name={item.name}
                  key={item.id}
                />
              );
            })}
          </div>
          <Button onClick={this.props.acknowledgeRewards} primary>Continue</Button>
        </div>
        <div className={`modal ${this.state.showDefeat ? 'shown': ''}`}>
          <h3>You were defeated by the monster!</h3>
          {inventory[0].quantity > 0
            ?
              <p>You have been charged {inventory[0].quantity} gold to be resurrected and to rest in town until fully recovered</p>
            :
              <p>Luckily, you were resurrected and allowed to rest in town until fully recovered in hopes that you will have money next time</p>
          }
          <Button onClick={() => this.props.heroDie()} primary>Continue</Button>
        </div>
        {this.state.combatMessage && <div className="combat-message">{this.state.combatMessage}</div>}
        <div className="monsters">
          <Character
            imagesrc={monsterImages[monster.assetInfo.image]}
            stats={monster.stats}
            vitals={monster.vitals}
            action={this.state.actionTime.monster}
            show={["action", "health"]}
          />
        </div>
        <div className="heros">
          <Character
            imagesrc={heroImages[hero.assetInfo.image]}
            stats={hero.stats}
            action={this.state.actionTime.hero}
            vitals={hero.vitals}
            show={["action", "health", "mana"]}
          />
        </div>
      </div>
    );
  }
}

BattleStage.propTypes = {
  game: PropTypes.object.isRequired,
  transitionToLevel: PropTypes.func.isRequired,
  changeVitals: PropTypes.func.isRequired,
  heroDie: PropTypes.func.isRequired,
  setActionsDisabled: PropTypes.func.isRequired,
  acknowledgeRewards: PropTypes.func.isRequired,
  playSoundEffect: PropTypes.func.isRequired,
  setBgMusic: PropTypes.func.isRequired,
};