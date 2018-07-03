import React from 'react';
import PropTypes from 'prop-types';
import { Character, ItemCard, Button } from '../../ui';
import battleStages from '../../../assets/battle-backgrounds';
import heroImages from '../../../assets/heros';
import monsterImages from '../../../assets/monsters';
import './BattleStage.css';

export default class BattleStage extends React.Component {
  constructor(props) {
    super(props);
    const { game } = props;
    const { hero, monster } = game;
    // Set a timer to keep the battle moving
    this.battleTimer = setInterval(this.passTime, 200);
    this.attackTimers = {};

    // Delay monster attacks once action bar is full to make it more fair
    this.MONSTER_ATTACK_DELAY = 1000;

    this.state = {
      showRewards: false,
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
    };
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
    if (this.props.game.monster.vitals.health <= 0 && !this.state.showRewards) {
      this.props.setBgMusic('combatVictory', 1500);
      this.setState({showRewards: true});
      clearInterval(this.battleTimer);
      Object.entries(this.attackTimers).forEach(([_, timer]) => {
        clearTimeout(timer);
      });
    }
  }

  componentWillUnmount() {
    // Clean up the battle timers (hero die will make this happen right now)
    // TODO: Show hero die modal similar to rewards instead of this
    clearInterval(this.battleTimer);
    Object.entries(this.attackTimers).forEach(([_, timer]) => {
      clearTimeout(timer);
    });
  }

  monsterAttack = (name = 'monster', target = 'hero') => {
    const { game } = this.props;
    const attacker = game[name];
    const defender = game[target];
    // TODO: Allow monster to use skills if they have them (some sort of AI going on here)
    const criticalMult = this.props.checkCritical(attacker, defender) ? 5 : 1;
    const damage = this.props.calculateDamage(attacker.stats.attack, defender.stats.defence, criticalMult);
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
            this.props.setActionsAvailable(name, true);
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
      level
    } = game;
    const backgroundName = `${level.assetInfo.battleBg}Battle`;

    return (
      <div className="BattleStage" style={{ backgroundImage: `url("${battleStages[backgroundName]}")`}}>
        <div className={`rewards ${this.state.showRewards ? 'shown': ''}`}>
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
  monsterDie: PropTypes.func.isRequired,
  heroDie: PropTypes.func.isRequired,
  setActionsAvailable: PropTypes.func.isRequired,
  calculateDamage: PropTypes.func.isRequired,
  acknowledgeRewards: PropTypes.func.isRequired,
  checkCritical: PropTypes.func.isRequired,
  playSoundEffect: PropTypes.func.isRequired,
  setBgMusic: PropTypes.func.isRequired,
};