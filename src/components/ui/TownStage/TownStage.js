import React from 'react';
import PropTypes from 'prop-types';
import { Modal, GameList, InventoryList, SkillList, Equipment } from '../../ui';
import allMagic from '../../../assets/data/magic.json';
import allSkills from '../../../assets/data/skills.json';
import {
  skillNotUseableOutsideBattle,
  calculateSkillDamage,
  calculateSkillEffect,
} from '../../../helpers/battleHelpers';
import './TownStage.css';
import { getShopItems, canBeSold } from '../../../helpers/itemHelpers';

export default class TownStage extends React.PureComponent {
  constructor(props) {
    super(props);

    this.INN_COST_PER_LEVEL = 10;
    
    this.townActions = {
      town: [
        { name: 'Inn', onClick: () => this.setState({location: 'inn'}) },
        { name: 'Blacksmith', onClick: () => this.setState({location: 'blacksmith'}) },
        { name: 'Training Grounds', onClick: () => this.setState({location: 'training'}) },
        { name: 'General Store', onClick: () => this.setState({location: 'generalStore'}) },
        { name: 'Inventory', secondary: true, onClick: () => this.setState({townAction: 'inventory'}) },
        { name: 'Equipment', secondary: true, onClick: () => this.setState({townAction: 'equipment'}) },
        { name: 'Skills', secondary: true, onClick: () => this.setState({townAction: 'skills'}) },
        { name: 'Magic', secondary: true, onClick: () => this.setState({townAction: 'magic'}) },
        { name: 'Save Game', secondary: true, onClick: () => this.setState({townAction: 'save-game'}) },
        { name: 'Main Menu', destructive: true, onClick: () => this.props.showMenu(this.state) },
        { name: 'Go to dungeon', secondary: true, onClick: () => this.props.transitionToLevel("level1") },
      ],
      blacksmith: [
        { name: 'Buy', primary: true, onClick: () => this.setState({townAction: 'buy-equipment'}) },
        { name: 'Sell', destructive: true, onClick: () => this.setState({townAction: 'sell-items'}) },
        { name: 'Upgrade', secondary: true, onClick: () => this.setState({townAction: 'upgrade-equipment'}) },
        { name: 'Back to town', secondary: true, onClick: () => this.setState({location: 'town'}) },
      ],
      training: [
        { name: 'Train Skills', primary: true, onClick: () => this.setState({townAction: 'train-skills'}) },
        { name: 'Train Magic', primary: true, onClick: () => this.setState({townAction: 'train-magic'}) },
        { name: 'Back to town', secondary: true, onClick: () => this.setState({location: 'town'}) },
      ],
      generalStore: [
        { name: 'Buy', primary: true, onClick: () => this.setState({townAction: 'buy-items'}) },
        { name: 'Sell', destructive: true, onClick: () => this.setState({townAction: 'sell-items'}) },
        { name: 'Back to town', secondary: true, onClick: () => this.setState({location: 'town'}) },
      ],
      inn: [
        { name: 'Rest', onClick: () => this.setState({townAction: 'inn'}) },
        { name: 'Quests', disabled: true},
        { name: 'Back to town', secondary: true, onClick: () => this.setState({location: 'town'}) },
      ],
    }

    this.props.setAvailableActions(this.townActions['town']);
    const maxItemLevel = Math.floor(props.game.hero.stats.level / 5) || 1;
    const minItemLevel = maxItemLevel - 2 > 0 ? maxItemLevel - 2 : 1;

    this.state = {
      townAction: null,
      location: 'town',
      blacksmithInventory: getShopItems({
        shopType: 'blacksmith',
        minLevel: minItemLevel,
        maxLevel: maxItemLevel
      }),
      generalStoreInvetory: getShopItems({
        shopType: 'general-store',
        minLevel: minItemLevel,
        maxLevel: maxItemLevel
      }),
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.location !== prevState.location) {
      this.props.setAvailableActions(this.townActions[this.state.location]);
    }
  }

  restAtInn = () => {
    const { game } = this.props;
    const cost = game.hero.stats.level * this.INN_COST_PER_LEVEL;
    const health = game.hero.stats.health - game.hero.vitals.health;
    const mana = game.hero.stats.mana - game.hero.vitals.mana;

    this.props.changeVitals('hero', {health, mana, gold: -cost});
    this.setState({townAction: null});
  }

  useSkill = (skill) => {
    const {
      maxDamage,
      manaCost,
    } = calculateSkillEffect({attacker: this.props.game.hero, skill});
    
    const skillSound = skill.assetInfo.sound && skill.assetInfo.sound !== '' && skill.assetInfo.sound;
    this.props.playSoundEffect(skillSound);

    const healing = calculateSkillDamage(maxDamage);
    this.props.changeVitals('hero', {health: healing, mana: -manaCost});
    this.setState({townAction: null});
  }

  checkIfSkillDisabled = (skill) => {
    const level = skill.level;
    const cost = skill.cost;
    const multiplier = skill.levels[level].multiplier;
    const requiredMana = Math.ceil(cost * multiplier);
    const notEnoughMana = !(this.props.game.hero.vitals.mana >= requiredMana);
    return notEnoughMana || skillNotUseableOutsideBattle(skill);
  }

  closeModal = () => this.setState({townAction: null});

  render() {
    const {
      game,
      changeInventoryOrEquipment,
      learnOrUpgradeSkill,
      gameSlots,
    } = this.props;

    const { hero, inventory } = game;

    let modalActions = null;
    let modalTitle = null;
    let fullWidth = null;
    const modalContent = (() => {
      switch (this.state.townAction) {
        case 'inn':
          const cost = game.hero.stats.level * this.INN_COST_PER_LEVEL;
          const playerCanRest = game.inventory[0].quantity >= cost;
          modalTitle = <h2>Inn</h2>;
          modalActions = [
            {
              name: 'Yes',
              primary: true,
              disabled: !playerCanRest,
              tooltip: !playerCanRest && 'Not enough gold',
              onClick: this.restAtInn,
            },
            { name: 'No', destructive: true, onClick: this.closeModal },
          ];
          return <p>Would you like to rest for {cost} gold?</p>;
        case 'save-game':
          modalTitle = 'Select a slot to save your game';
          modalActions = [{ name: 'Close', destructive: true, onClick: this.closeModal }];
          return (
            <GameList
              gameSlots={gameSlots}
              action="save"
              currentData={game} 
            />
          );
        case 'inventory':
          modalTitle = <h2>Inventory</h2>;
          modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
          fullWidth = true;
          return (
            <InventoryList
              items={inventory}
              capacity={hero.equipment.backpack.attributes.capacity}
              changeInventoryOrEquipment={changeInventoryOrEquipment}
              showStatus
            />
          );
        case 'equipment':
          modalTitle = <h2>Equipment</h2>;
          modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
          fullWidth = true;
          return (
            <Equipment
              character={hero}
              changeInventoryOrEquipment={changeInventoryOrEquipment}
            />
          );
        case 'magic':
          modalTitle = <h2>Magic</h2>
          modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
          return (
            <SkillList
              skills={hero.magic}
              hero={hero}
              onSelectSkill={this.useSkill}
              disableFn={this.checkIfSkillDisabled}
            />
          );
        case 'skills':
          modalTitle = <h2>Skills</h2>
          modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
          return (
            <SkillList
              skills={hero.skills}
              hero={hero}
              onSelectSkill={this.useSkill}
              disableFn={this.checkIfSkillDisabled}
            />
          );
        case 'train-magic':
          modalTitle = <h2>Magic Tranining</h2>
          modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
          return (
            <SkillList
              skills={allMagic}
              hero={hero}
              gold={inventory[0].quantity}
              onSkillAction={learnOrUpgradeSkill}
              isTraining={true}
            />
          );
        case 'train-skills':
          modalTitle = <h2>Skills Tranining</h2>
          modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
          return (
            <SkillList
              skills={allSkills}
              hero={hero}
              gold={inventory[0].quantity}
              onSkillAction={learnOrUpgradeSkill}
              isTraining={true}
            />
          );
        case 'buy-items':
          modalTitle = <h2>General Store</h2>
          modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
          return (
            <InventoryList
              items={this.state.generalStoreInvetory}
              buySellUpgrade="buy"
              gold={inventory[0].quantity}
              changeInventoryOrEquipment={changeInventoryOrEquipment}
            />
          );
        case 'sell-items':
          modalTitle = <h2>Sell Items</h2>
          modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
          return (
            <InventoryList
              items={inventory}
              buySellUpgrade="sell"
              disableFn={canBeSold}
              capacity={hero.equipment.backpack.attributes.capacity}
              changeInventoryOrEquipment={changeInventoryOrEquipment}
            />
          );
        case 'buy-equipment':
          modalTitle = <h2>Blacksmith</h2>
          modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
          return (
            <InventoryList
              items={this.state.blacksmithInventory}
              buySellUpgrade="buy"
              gold={inventory[0].quantity}
              changeInventoryOrEquipment={changeInventoryOrEquipment}
            />
          );
        case 'upgrade-equipment':
          modalTitle = <h2>Upgrade Equipment</h2>
          modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
          return (
            <React.Fragment>
              <p>Inventory</p>
              <InventoryList
                items={inventory}
                buySellUpgrade="upgrade"
                gold={inventory[0].quantity}
                changeInventoryOrEquipment={changeInventoryOrEquipment}
              />
              <p>Equipped</p>
              <InventoryList
                items={Object.entries(hero.equipment).map(([_, item]) => item)}
                buySellUpgrade="upgrade-equipped"
                gold={inventory[0].quantity}
                changeInventoryOrEquipment={changeInventoryOrEquipment}
              />
            </React.Fragment>
          );
        default:
          return null;
      }
    })();

    return (
      <div className="TownStage">
        <Modal
          title={modalTitle}
          fullWidth={fullWidth}
          shown={this.state.townAction !== null}
          onClose={this.closeModal}
          actions={modalActions}
          backgroundClickCloses
        >
          {modalContent}
        </Modal>
      </div>
    );
  }
}

TownStage.propTypes = {
  game: PropTypes.object.isRequired,
  transitionToLevel: PropTypes.func.isRequired,
  showMenu: PropTypes.func.isRequired,
  changeVitals: PropTypes.func.isRequired,
  learnOrUpgradeSkill: PropTypes.func.isRequired,
  gameSlots: PropTypes.arrayOf(PropTypes.string).isRequired,
};