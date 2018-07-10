import React from 'react';
import PropTypes from 'prop-types';
import { Modal, InventoryList } from '../../ui';
import './DungeonStage.css';

export default class DungeonStage extends React.Component {
  constructor(props) {
    super(props);
    const dungeonActions = [
      {name: 'Inventory', secondary: true, onClick: this.showInventoryModal },
      {name: 'Enter combat', destructive: true, onClick: this.props.startFight },
      {name: 'Go to town', secondary: true, onClick: this.props.goToTown },
    ];

    this.props.setAvailableActions(dungeonActions);

    this.state = {
      showInventory: false,
    };
  }

  closeModal = () => {
    this.setState({showInventory: false})
  }

  showInventoryModal = () => {
    this.setState({showInventory: true});
  }

  render() {
    return (
      <div className="DungeonStage">
        Yo, this here's the dungeon. We be implmenting some coo graphics at some point so you can actually do some shiznit
        <Modal
          title={<h2>Inventory</h2>}
          shown={this.state.showInventory}
          actions={[{ name: 'Close', primary: true, onClick: this.closeModal }]}
          onClose={this.closeModal}
          backgroundClickCloses
          fullWidth
        >
          <InventoryList 
            items={this.props.game.inventory}
            capacity={this.props.game.hero.equipment.backpack.attributes.capacity}
            changeInventoryOrEquipment={this.props.changeInventoryOrEquipment}
          />
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