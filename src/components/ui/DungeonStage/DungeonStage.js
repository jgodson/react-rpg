import React from 'react';
import PropTypes from 'prop-types';
import { Modal, InventoryList, SkillList } from '../../ui';
import {
  skillNotUseableOutsideBattle,
  calculateSkillDamage,
  calculateSkillEffect
} from '../../../helpers/battleHelpers';
import './DungeonStage.css';

export default class DungeonStage extends React.Component {
  constructor(props) {
    super(props);
    const dungeonActions = [
      { name: 'Inventory', secondary: true, onClick: () => this.setState({showModal: 'inventory'}) },
      { name: 'Skills', secondary: true, onClick: () => this.setState({showModal: 'skills'}) },
      { name: 'Magic', secondary: true, onClick: () => this.setState({showModal: 'magic'}) },
      { name: 'Enter combat', destructive: true, onClick: this.props.startFight },
      { name: 'Go to town', secondary: true, onClick: this.props.goToTown },
    ];

    this.props.setAvailableActions(dungeonActions);

    this.state = {
      showModal: false,
    };
  }

  closeModal = () => {
    this.setState({showModal: false})
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
    this.setState({showModal: false});
  }

  checkIfSkillDisabled = (skill) => {
    const level = skill.level;
    const cost = skill.cost;
    const multiplier = skill.levels[level].multiplier;
    const requiredMana = Math.ceil(cost * multiplier);
    const notEnoughMana = !(this.props.game.hero.vitals.mana >= requiredMana);
    return notEnoughMana || skillNotUseableOutsideBattle(skill);
  }

  render() {
    const { game, changeInventoryOrEquipment } = this.props;
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
              items={game.inventory}
              capacity={game.hero.equipment.backpack.attributes.capacity}
              changeInventoryOrEquipment={changeInventoryOrEquipment}
            />
          );
        case 'magic':
          modalTitle = <h2>Magic</h2>
          modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
          return (
            <SkillList
              skills={game.hero.magic}
              hero={game.hero}
              onSelectSkill={this.useSkill}
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
              onSelectSkill={this.useSkill}
              disableFn={this.checkIfSkillDisabled}
            />
          );
        default:
          return;
      }
    })();

    return (
      <div className="DungeonStage">
        Yo, this here's the dungeon. We be implmenting some coo graphics at some point so you can actually do some shiznit
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

DungeonStage.propTypes = {
  game: PropTypes.object.isRequired,
  transitionToLevel: PropTypes.func.isRequired,
  changeVitals: PropTypes.func.isRequired,
  heroDie: PropTypes.func.isRequired,
  setAvailableActions: PropTypes.func.isRequired,
  changeInventoryOrEquipment: PropTypes.func.isRequired,
};