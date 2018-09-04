import React from 'react';
import PropTypes from 'prop-types';
import {
  Character,
  ItemCard,
  Button,
  Modal,
  InventoryList,
  SkillList,
} from '../../ui';
import battleStages from '../../../assets/battle-backgrounds';
import {
  checkIfSuccessful,
  MINIMUM_DAMAGE_PERCENTAGE,
  MINIMUM_DEFENCE_PERCENTAGE,
  skillNotUseableInBattle,
  calculateSkillDamage,
  calculateSkillEffect,
} from '../../../helpers/battleHelpers';
import { consumableInBattle } from '../../../helpers/itemHelpers';
import allItems from '../../../assets/data/items.json';
import './BattleStage.css';

export default class BattleStage extends React.Component {
  constructor(props) {
    super(props);
    const { game } = props;
    const { hero, monster } = game;

    // Set a timer to keep the battle moving
    this.battleTimer = setInterval(this.passTime, 200);
    this.messageTimer = null;

    // Minimum and improved chance of running from battle 
    this.RETREAT_CHANCE = 80;
    // High agility and dexterity get you a better chance of retreating
    this.RETREAT_CHANCE_IMPROVED = 90;

    // Damage is multiplied by this amount when a critical hit occurs
    this.CRITICAL_HIT_MULTIPLIER = 3;
    // Chance of inflicting a critical hit
    this.CRITICAL_HIT_CHANCE = 2;
    // High agility and dexterity get you a better chance of critical hit
    this.CRITICAL_HIT_CHANCE_IMPROVED = 3;

    // Chance of hitting your target
    this.HIT_CHANCE = 95;
    // High agility and dexterity get you a better chance of hitting
    this.HIT_CHANCE_IMPROVED = 98;

    this.state = {
      showRewards: false,
      showDefeat: false,
      showModal: false,
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
      {
        name: 'Skills',
        destructive: true,
        disabled: hero.skills.length === 0,
        onClick: this.showSkills
      },
      {
        name: 'Magic',
        destructive: true,
        disabled: hero.magic.length === 0,
        onClick: this.showMagic 
      },
      { name: 'Items', secondary: true, onClick: this.showInventory },
      { name: 'Run', secondary: true, onClick: this.retreat },
    ];

    this.props.setAvailableActions(combatActions);
  }

  componentDidUpdate() {
    const { game } = this.props;
    const { monster, hero } = game;
    // Check if monster or hero is dead
    if (monster.vitals.health <= 0 && !this.state.showRewards) {
      this.props.playSoundEffect(monster.assetInfo.deathSound);
      this.props.setBgMusic('combatVictory', 500);
      this.setState({showRewards: true});
      const rewardsActions = [
        { name: 'Items', secondary: true, onClick: this.showInventory },
      ];
      this.props.setAvailableActions(rewardsActions);
      setTimeout(this.props.setActionsDisabled('hero', false), 0);
      this.clearTimers();
    } else if (hero.vitals.health <= 0 && !this.state.showDefeat) {
      this.props.playSoundEffect(hero.assetInfo.deathSound);
      this.props.setBgMusic('combatDefeat', 500);
      this.setState({showDefeat: true});
      this.clearTimers();
    } else if (this.state.actionTime.hero === 100 && this.state.actionCharging.monster === true) {
      this.setState({
        actionCharging: {
          ...this.state.actionCharging,
          monster: false,
        },
      });
    } else if (this.state.actionTime.hero === 0 && this.state.actionCharging.monster === false) {
      this.setState({
        actionCharging: {
          ...this.state.actionCharging,
          monster: true,
        },
      });
    }
  }

  componentWillUnmount() {
    // Clean up the battle timers (hero die will make this happen right now)
    this.clearTimers();
  }

  onItemAction = () => {
    this.props.setActionsDisabled('hero', true);
    this.setState({
      showModal: false,
      actionTime: {
        ...this.state.actionTime,
        hero: 0,
      },
    });
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

  showInventory = () => {
    this.setState({showModal: 'inventory'});
  }

  showMagic = () => {
    this.setState({showModal: 'magic'});
  }

  showSkills = () => {
    this.setState({showModal: 'skills'});
  }

  closeModal = () => this.setState({showModal: false});

  clearTimers = () => {
    clearInterval(this.battleTimer);
    clearTimeout(this.messageTimer);
  }

  monsterAttack = (name = 'monster', target = 'hero') => {
    const { game } = this.props;
    const attacker = game[name];
    const defender = game[target];
    // TODO: Allow monster to use skills if they have them (some sort of AI going on here)
    const criticalMult = this.checkCritical(attacker, defender) ? this.CRITICAL_HIT_MULTIPLIER : 1;
    const damage = this.calculateDamage(attacker.stats.attack, defender.stats.defence, criticalMult);
    this.props.playSoundEffect(attacker.assetInfo.attackSound);

    const hit = this.checkHit(attacker, defender);
    if (hit) {
      this.props.changeVitals(target, {health: -damage});
      this.setState({
        actionTime: {
          ...this.state.actionTime,
          [name]: 0,
        },
      });
    } else {
      this.missedAttack(name);
    }
  }

  heroAttack = () => {
    const { game } = this.props;
    const attacker = game.hero;
    const defender = game.monster;

    const criticalMult = this.checkCritical(attacker, defender) ? this.CRITICAL_HIT_MULTIPLIER : 1;
    const damage = this.calculateDamage(attacker.stats.attack, defender.stats.defence, criticalMult);
    const weaponSound = game.hero.equipment.weapon 
      && game.hero.equipment.weapon.assetInfo
      && game.hero.equipment.weapon.assetInfo.attackSound;
    const attackSound = weaponSound || game.hero.assetInfo.attackSound;
    this.props.playSoundEffect(attackSound);

    const hit = this.checkHit(attacker, defender);
    this.props.setActionsDisabled('hero', true);
    if (hit) {
      setTimeout(() => this.props.changeVitals('monster', {health: -damage}), 0);
      this.setState({
        actionTime: {
          ...this.state.actionTime,
          hero: 0,
        },
      });
    } else {
      this.missedAttack('hero');
    }
  }

  checkHit = (attacker, defender) => {
    const attackerPoints = attacker.stats.dexterity + attacker.stats.agility;
    const defenderPoints = defender.stats.dexterity + defender.stats.agility;
    const randomizer = Math.random() * 100;
    if (attackerPoints > defenderPoints) {
      return randomizer > (100 - this.HIT_CHANCE_IMPROVED);
    }
    return randomizer > (100 - this.HIT_CHANCE);
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

  useSkill = (attackerName, defenderName, skill) => {
    const { game, changeVitals, setActionsDisabled } = this.props;
    const attacker = game[attackerName]
    const defender = game[defenderName];
    const { maxDamage, skillDefence, manaCost } = calculateSkillEffect({attacker, defender, skill});
    let actualDamage = 0;
    let skillSound = skill.assetInfo.sound && skill.assetInfo.sound !== '' && skill.assetInfo.sound;
    let weaponSound = game.hero.equipment.weapon
      && game.hero.equipment.weapon.assetInfo
      && game.hero.equipment.weapon.assetInfo.attackSound
      && game.hero.equipment.weapon.assetInfo.attackSound !== ''
      && game.hero.equipment.weapon.assetInfo.attackSound;
    let attackSound = attackerName === 'hero' 
      ? 
        skillSound || weaponSound || game.hero.assetInfo.attackSound
      :
        skillSound || game[attackerName].assetInfo.attackSound;

    if (skill.target === 'self') {
      actualDamage = calculateSkillDamage(maxDamage);
      changeVitals(attackerName, {health: actualDamage});
    } else {
      actualDamage = calculateSkillDamage(maxDamage, skillDefence);
      changeVitals(defenderName, {health: actualDamage});
    }
    this.props.playSoundEffect(attackSound);

    setTimeout(() => changeVitals(attackerName, {mana: -manaCost}), 0);
    if (attackerName === 'hero') {
      setTimeout(() => setActionsDisabled('hero', true), 0);
      this.setState({
        showModal: false,
        actionTime: {
          ...this.state.actionTime,
          [attackerName]: 0,
        },
      });
    } else {
      this.setState({
        showModal: false,
        actionTime: {
          ...this.state.actionTime,
          [attackerName]: 0,
        },
        actionCharging: {
          ...this.state.actionCharging,
          [attackerName]: true,
        },
      });
    }
  }

  skillSelected = (skill) => {
    this.useSkill('hero', 'monster', skill);
  }

  checkIfSkillDisabled = (skill) => {
    const level = skill.level;
    const cost = skill.cost;
    const multiplier = skill.levels[level].multiplier;
    const requiredMana = Math.ceil(cost * multiplier);
    const notEnoughMana = !(this.props.game.hero.vitals.mana >= requiredMana);
    return notEnoughMana || skillNotUseableInBattle(skill);
  }

  missedAttack = (name) => {
    this.messageTimer = setTimeout(() => this.setState({combatMessage: null}), 2000);
    this.setState({
      combatMessage: `${name[0].toUpperCase() + name.substring(1)} missed!`,
      actionTime: {
        ...this.state.actionTime,
        [name]: 0,
      }
    });
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
      this.monsterAttack(monster, 'hero');
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
    const disableItemActions = this.state.showRewards ? ['equip'] : ['drop', 'equip'];

    // Check if there is room in inventory for rewards
    const capacity = hero.equipment.backpack.attributes.capacity;
    const currentItems = inventory.length;
    const monsterItems = monster.rewards.items.length;
    const hasRoom = capacity >= currentItems + monsterItems;
    const noRoomMessage = 
      `You do not have room for some of these items, remove ${currentItems + monsterItems - capacity} items\
      to make room or you will not receive these items.`;

      let modalActions = null;
      let modalTitle = null;
      let fullWidth = null;
      const modalContent = (() => {
        switch (this.state.showModal) {
          case 'inventory':
            modalTitle = <h2>Inventory</h2>;
            modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
            fullWidth = true;
            return (
              <InventoryList 
                items={inventory}
                capacity={this.state.showRewards ? hero.equipment.backpack.attributes.capacity : null}
                disableFn={consumableInBattle}
                disableItemActions={disableItemActions}
                changeInventoryOrEquipment={this.props.changeInventoryOrEquipment}
                onAction={this.onItemAction}
                showStatus={this.state.showRewards}
              />
            );
          case 'magic':
            modalTitle = <h2>Magic</h2>
            modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
            return (
              <SkillList
                skills={game.hero.magic}
                hero={game.hero}
                onSelectSkill={this.skillSelected}
                disableFn={this.checkIfSkillDisabled}
              />
            );
          case 'skills':
            modalTitle = <h2>Skills</h2>
            modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
            return (
              <SkillList
                skills={game.hero.skills}
                hero={game.hero}
                onSelectSkill={this.skillSelected}
                disableFn={this.checkIfSkillDisabled}
              />
            );
          default:
            return;
        }
      })();

    return (
      <div className="BattleStage" style={{ backgroundImage: `url("${battleStages[backgroundName]}")`}}>
        <div className={`modal ${this.state.showRewards ? 'shown': ''}`}>
          <h3>You defeated the monster!</h3>
          <p>Gained {monster.rewards.exp} experience!</p>
          <p>{!hasRoom ? noRoomMessage : 'The monster dropped some items!'}</p>
          <div className="items">
              <ItemCard
                item={allItems[0]}
                quantity={monster.rewards.gold}
              />
            {monster.rewards.items.map((item, index) => {
              return (
                <ItemCard
                  item={item}
                  quantity={1}
                  disabled={capacity < (index + 1 + currentItems)}
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
            character={monster}
            action={this.state.actionTime.monster}
            show={["action", "health"]}
            tooltip={["stats:level"]}
          />
        </div>
        <div className="heros">
          <Character
            character={hero}
            action={this.state.actionTime.hero}
            show={["action", "health", "mana"]}
          />
        </div>
        <Modal
          title={modalTitle}
          shown={this.state.showModal !== false}
          actions={modalActions}
          onClose={this.closeModal}
          backgroundClickCloses
          fullWidth={fullWidth}
        >
          {modalContent}
        </Modal>
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