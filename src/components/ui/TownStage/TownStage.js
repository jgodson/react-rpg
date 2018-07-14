import React from 'react';
import PropTypes from 'prop-types';
import { Modal, GameList, InventoryList, SkillList } from '../../ui';
import allMagic from '../../../assets/data/magic.json';
import allSkills from '../../../assets/data/skills.json';
import './TownStage.css';

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
        { name: 'Save Game', secondary: true, onClick: () => this.setState({townAction: 'save-game'}) },
        { name: 'Main Menu', destructive: true, onClick: () => this.props.showMenu(this.state) },
        { name: 'Go to dungeon', secondary: true, onClick: () => this.props.transitionToLevel("level1") },
      ],
      blacksmith: [
        { name: 'Buy', disabled: true},
        { name: 'Sell', disabled: true},
        { name: 'Enhance', disabled: true},
        { name: 'Back to town', secondary: true, onClick: () => this.setState({location: 'town'}) },
      ],
      training: [
        { name: 'Train Skills', primary: true, onClick: () => this.setState({townAction: 'train-skills'}) },
        { name: 'Train Magic', primary: true, onClick: () => this.setState({townAction: 'train-magic'}) },
        { name: 'Back to town', secondary: true, onClick: () => this.setState({location: 'town'}) },
      ],
      generalStore: [
        { name: 'Buy', disabled: true},
        { name: 'Sell', disabled: true},
        { name: 'Back to town', secondary: true, onClick: () => this.setState({location: 'town'}) },
      ],
      inn: [
        { name: 'Rest', onClick: () => this.setState({townAction: 'inn'}) },
        { name: 'Quests', disabled: true},
        { name: 'Back to town', secondary: true, onClick: () => this.setState({location: 'town'}) },
      ],
    }

    this.props.setAvailableActions(this.townActions['town']);

    this.state = {
      townAction: null,
      location: 'town'
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.location !== prevState.location) {
      this.props.setAvailableActions(this.townActions[this.state.location]);
    }
  }

  restAtInn = () => {
    const { game } = this.props;
    const cost = game.hero.stats.level * 15;
    const health = game.hero.stats.health - game.hero.vitals.health;
    const mana = game.hero.stats.mana - game.hero.vitals.mana;

    this.props.changeVitals('hero', {health, mana, gold: -cost});
    this.setState({townAction: null});
  }

  closeModal = () => this.setState({townAction: null});

  render() {
    const { game } = this.props;

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
              gameSlots={this.props.gameSlots}
              action="save"
              currentData={this.props.game} 
            />
          );
        case 'inventory':
          modalTitle = <h2>Inventory</h2>;
          modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
          fullWidth = true;
          return (
            <InventoryList
              items={this.props.game.inventory}
              capacity={this.props.game.hero.equipment.backpack.attributes.capacity}
              changeInventoryOrEquipment={this.props.changeInventoryOrEquipment}
            />
          );
        case 'train-magic':
          modalTitle = <h2>Magic Tranining</h2>
          modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
          fullWidth = true;
          return (
            <SkillList
              skills={allMagic}
              hero={game.hero}
              gold={game.inventory[0].quantity}
              onSkillAction={this.props.learnOrUpgradeSkill}
              isTraining={true}
            />
          );
        case 'train-skills':
          modalTitle = <h2>Skills Tranining</h2>
          modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
          fullWidth = true;
          return (
            <SkillList
              skills={allSkills}
              hero={game.hero}
              gold={game.inventory[0].quantity}
              onSkillAction={this.props.learnOrUpgradeSkill}
              isTraining={true}
            />
          );
        default:
          return;
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
  learnOrUpgradeSkill: PropTypes.func.isRequired,
  gameSlots: PropTypes.arrayOf(PropTypes.string).isRequired,
};